import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { getUserInfo } from 'utils/Api.js'
import ol from 'openlayers'
import { connect } from 'react-redux'
import { saveFeature, setFeature } from '_redux/actions/feature'
import { setFieldMessage, showFieldMessage, startFieldMessage } from '_redux/actions/fieldMessage'
import { getArea } from 'utils/tools'
import 'css/map/polygon.scss'
import CreateField from './CreateField'
import Rx from 'rxjs/Rx'
import Popup from './Popup'
function getStyle(obj, attr) {
    if (obj.currentStyle) {
        return obj.currentStyle[attr]
    } else {
        return getComputedStyle(obj, false)[attr]
    }
}
function getCenterOfExtent(Extent) {
    var X = Extent[0] + (Extent[2] - Extent[0]) / 2
    var Y = Extent[1] + (Extent[3] - Extent[1]) / 2
    return [X, Y]
}
class Polygon extends Component {
    constructor() {
        super()
        this.state = {
            initial: false,
            coord: [],
            area: null,    // 选中feature的面积
            feature: null,
            popupText: undefined
        }
    }
    componentDidMount() {
        this.load(this.props)
        this.props.onRef(this)
        Rx.Observable.fromEvent(document, 'keydown')
            .filter(e => e.keyCode === 27)
            .map(e => true)
            .subscribe(flag => {
                if (flag && this.draw.getActive()) {
                    this.props.removeDraw()
                    this.draw.setActive(false)
                }
            })

        const {map} = this.props.map
        map.on('pointermove', (evt) => {
            if (evt.dragging) {

                return
            }
            this.displayFeatureInfo(map.getEventPixel(evt.originalEvent))
        })
    }
    componentDidUpdate(prevProps, prveState) {
        prevProps.draw && this.draw.setActive(true)
        
    }
    load(props) {
        const { map } = props.map
        if (!map) {
            return 
        }
        const polyonSource = new ol.source.Vector({
        })
        this.polyonLayer = new ol.layer.Vector({
            source: polyonSource,
            zIndex: 13,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: [117, 172, 71, 0.7]
                }),
                stroke: new ol.style.Stroke({
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    color: [107, 98, 0, 1.0],
                    width: 3
                })
            })
        })
        map.addLayer(this.polyonLayer)

       
       

        this.draw = new ol.interaction.Draw({
            source: polyonSource,
            type: 'Polygon'
        })
        map.addInteraction(this.draw)
        this.draw.setActive(false)

        this.polygonModify = new ol.interaction.Modify({
            source: polyonSource
        })
        map.addInteraction(this.polygonModify)
        this.polygonModify.setActive(false)
        
        //  备用
        // this.translate = new ol.interaction.Translate({
        //     layers: [this.polyonLayer]
        // })
        // this.translate.on('translateend', function (evt) {
        //     var feature = evt.features.a[0]
        //     var payload = geoJson.writeFeature(feature, {
        //         featureProjection: map.getView().getProjection()
        //     })
        //     var center = ol.extent.getCenter(feature.getGeometry().getExtent())
        // })
        //  备用end

        var geoJson = new ol.format.GeoJSON()
        this.draw.on('drawend', (evt) => {
            var feature = evt.feature

            new Promise((resolve, reject) => {
                if (Number.parseFloat(getArea(feature)) > 2000) {
                    alert('您圈选的田地面积不符合实际情况，请重新圈选')
                    resolve('')
                } else {
                    reject(this.props.removeDraw)
                }
            }).then(() => {
                polyonSource.clear()
            }).catch(fn => {
                this.props.removeDraw()
                this.draw.setActive(false)
            })
            this.polygonModify && this.polygonModify.setActive(true)
            // this.setState({
            //     area: this.getArea(feature),
            //     feature
            // })
            // text 开始作妖
            // this.drawText(evt.feature)
            this.props.saveFeature(evt.feature) //
        })
        
        this.polygonModify.on('modifyend', (evt) => {
            // this.drawText(evt.features.a[0])
            var feature = evt.features.a[0]
            this.props.saveFeature(feature)
            this.setState({
                area: getArea(feature),
                feature,
                // coord: ol.extent.getCenter(feature.getGeometry().getExtent()),
            })
            // var payload = geoJson.writeFeature(feature, {
            //     featureProjection: map.getView().getProjection()
            // })
            // var center = ol.extent.getCenter(feature.getGeometry().getExtent())
        })  
        map.on('click', (evt) => this.clickListener(evt))
    }
    clickListener(evt) {
        const { map } = this.props.map
        const feature = map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => layer && !layer.get('id') && feature)
        if (feature) {
            this.props.saveFeature(feature)
            this.props.startFieldMessage(false)
            this.props.showFieldMessage(false)
            const id = feature.getId()
            const name = feature.get('name')
            const isNew = feature.get('status')
            if (!id) {
                this.setState({
                    feature,
                    initial: true,
                    coord: ol.extent.getCenter(feature.getGeometry().getExtent()),
                    area: getArea(feature)
                })
            }
        }
    }
    drawText() {        
        const {feature} = this.props.feature
        let extent = feature.getGeometry().getExtent()
        const { name, id, isNew, address } = this.props.feature
        
        this.state.feature.setId(id)
        this.state.feature.set('status', '1')
        this.state.feature.set('name', name)
        this.state.feature.set('address', address)
        const { area, popupText } = this.state
        
        this.setState({
            popupText: {
                id,
                name,
                growth_status: '0',
                username: getUserInfo().username,
                area: `${area.acre}亩`,
                coord: getCenterOfExtent(extent),
                map: this.props.map.map
            }
        })
        Array.from(document.getElementsByClassName('test')).forEach((e) => {
            Array.from(e.children).forEach(e => {
                e.style.fontSize = getStyle(e, 'font-size')
            })
        })
    }
    componentWillUnmount() {
        console.log('unmount')
        const { map } = this.props.map
        this.polyonLayer && map.removeLayer(this.polyonLayer)
        this.draw && this.draw.setActive(false)
    }

    setInitial() {
        this.setState({
            coord: undefined,
        })
    }
    setDefault() {
        this.setState({
            coord: undefined,
        })
        this.polygonModify.setActive(false)
    }
    sourceClear() {
        this.polyonLayer.getSource().removeFeature(this.state.feature)
        this.props.removeDraw()
        this.polygonModify.setActive(false)
    }
    clearSource() {
        const source = this.polyonLayer.getSource()
        source.getFeatures().forEach(feature => {
            !feature.getId() && source.clear(feature)
        })
        this.setState({
            coord: undefined,
        })
        this.props.removeDraw()
        this.polygonModify.setActive(false)
    }
    displayFeatureInfo = (pixel) => {
        const { map } = this.props.map
        var feature = map.forEachFeatureAtPixel(pixel, (feature, layer) => {
            if (layer === this.polyonLayer) {
                return feature
            }

        })
        if (feature) {
            if (feature !== this.state.feature) {
                this.setState({
                    feature
                })
                
               
               
            } 
            if (!feature.getId()) {
                return
            }
            this.child && this.child.setPosition(ol.extent.getCenter(feature.getGeometry().getExtent()))
        } else {
            this.child && this.child.setPosition(undefined)
        }

    }
    render() {
        if(this.draw) {
            this.draw.setActive(this.props.draw)
        }
        const {feature} = this.state
        return (
            <div className='polygon'>
                {
                    this.state.initial && <CreateField coord={this.state.coord} 
                        setDefault={this.setDefault.bind(this)} 
                        setInitial={this.setInitial.bind(this)} 
                        drawText={this.drawText.bind(this)} 
                        area={this.state.area}
                        feature={this.state.feature}
                        sourceClear={this.sourceClear.bind(this)}/>
                }
                {/* {this.state.popupText.map(p => <Popup key={p.id} {...p} />)} */}
                {this.state.popupText && <Popup ref={child => this.child = child}
                    name={feature.get('name')}
                    growth_status={'0'}
                    map={this.props.map.map}
                    coord={ol.extent.getCenter(feature.getGeometry().getExtent())}
                    area={getArea(feature).acre + '亩'}
                    username={getUserInfo().username}
                />}
            </div>
        )
    }
}
Polygon.propTypes = {
    map: PropTypes.object,
    draw: PropTypes.bool,
    removeDraw: PropTypes.func,
    feature: PropTypes.object,
    saveFeature: PropTypes.func,
    setFeature: PropTypes.func,
    clearSource: PropTypes.func,
    onRef: PropTypes.func,
    startFieldMessage: PropTypes.func,
    showFieldMessage: PropTypes.func
}
const mapStateToProps = (state) => {
    return {
        map: state.map,
        feature: state.feature,
        message: state.feature
    }
}
const mapDispathToProps = (dispatch) => {
    return {
        saveFeature: (feature) => {
            dispatch(saveFeature(feature))
        },
        setFeature: (config) => {
            dispatch(setFeature(config))
        },
        startFieldMessage: (start) => {
            dispatch(startFieldMessage(start))
        },
        showFieldMessage: (show) => {
            dispatch(showFieldMessage(show))
        }
    }
}
export default connect(mapStateToProps, mapDispathToProps)(Polygon)