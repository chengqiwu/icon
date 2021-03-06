import React, { Component } from 'react'
import PropType from 'prop-types'
import classnames from 'classnames'
import { connect } from 'react-redux'
import tools from 'images/common/tools.png'
import 'css/index/common/tools.scss'
import ol from 'openlayers'
import AutoComplete from './AutoComplete'
import zoomin from 'images/tools/zoomins.png'
import zoomout from 'images/tools/zoomouts.png'
import position from 'images/tools/position.png'

import play from 'images/tools/play.png'
import arrow from 'images/tools/arrow.png'

import lyrs from '_redux/init/lyrs'

function flyTo(view, location, done) {
  var duration = 3000
  var zoom = view.getZoom()
  var parts = 2
  var called = false
  function callback(complete) {
    --parts
    if (called) {
      return
    }
    if (parts === 0 || !complete) {
      called = true
      done(complete)
    }
  }
  view.animate({
    center: location,
    duration: duration
  }, callback)
  view.animate({
    zoom: zoom - 1,
    duration: duration / 2
  }, {
    zoom: 15,
    duration: duration / 2
  }, callback)
}

class Tools extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tools: false,
      mapLists: false,
      currentMap: null
      // maps: maps
    }
    this.showTools    = this.showTools.bind(this)
    this.showMapLists = this.showMapLists.bind(this)
    this.zoomOut = this.zoomOut.bind(this)
    this.zoomIn = this.zoomIn.bind(this)
    this.getPosition = this.getPosition.bind(this)
  }
  componentDidMount() {
    lyrs.forEach(lyr => {
      lyr.active && this.setState({
        currentMap: lyr.url
      })
    })
  }
  showTools() {
    this.setState({
      tools: !this.state.tools
    })
  }
  showMapLists() {
    this.setState({
      mapLists: !this.state.mapLists
    })
  }
  changeLayer(lyr) {
    console.log(lyr)

    const { map } = this.props.map
    lyrs.forEach(lyr => lyr.active = false)
    lyr.active = true
    this.setState({
      currentMap: lyr.url,
      mapLists: false
    })
    map.getLayers().getArray().forEach(lyr => {
      lyr.getPreload && map.removeLayer(lyr)
    })
    lyrs.forEach(lyr => {
      lyr.active && lyr.lyrs.forEach(ly =>  {
        map.addLayer(ly)
        ly.setZIndex(-1)
      })
    })
  }
  zoomIn() {
    const { map } = this.props.map
    const view = map.getView()
    const zoom = view.getZoom()
    view.animate({
      zoom: zoom + 1,
      duration: 1000
    })
  }
  zoomOut() {
    const { map } = this.props.map
    const view = map.getView()
    const zoom = view.getZoom()
    view.animate({
      zoom: zoom-1,
      duration: 1000
    })
  }
  getPosition() {
    const self = this
    var geolocation = new BMap.Geolocation()
    geolocation.getCurrentPosition(function(r){
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        console.log([r.point.lng, r.point.lat])
        self.props.map.map.getView().animate({
          center: ol.proj.transform([r.point.lng, r.point.lat], 'EPSG:4326', 'EPSG:3857'),
          duration: 2000,
          zoom: 14
        })
      }
      else {
        alert('failed' + this.getStatus())
      }
    }, { enableHighAccuracy: true })
  }

    
  render() {
    return (
      <div className='showTools'>
        <div className={classnames({
                   
          tools: true,
          hiden: !this.state.tools,
        })}>
          <AutoComplete {...this.props} flyTo={flyTo}/>
          <div className='tools-map'>
            <div onClick={this.zoomOut} className='btnHover'>
              <img src={zoomout} alt=""/>
            </div>
            <div onClick={this.zoomIn} className='btnHover'>
              <img src={zoomin} alt=""/>
            </div>
            <div className='btnHover'>
              <img src={position} alt=""  onClick={this.getPosition}/>
            </div>
          </div>
          <div className='changeLayer'>
            <img className='arrow' src={arrow} alt=""  onClick={this.showMapLists}/>
                        
            <img className='currentMap' style={{ width: '50px'}}  ref={currentMap => this.currentMap = currentMap} src={this.state.currentMap}/>
                        
            <ul className={classnames({
              'map-lists': true,
              'hiden': !this.state.mapLists
            })}>
              {
                lyrs.map((lyr, i) => !lyr.active && (
                  <li key={lyr.id}>
                    <img style={{width: '50px'}} src={lyr.url} alt={lyr.id}  onClick={this.changeLayer.bind(this, lyr)}/>
                  </li>
                ))
              }
            </ul>
          </div>
          <img src={play} alt="" onClick={this.showTools} className='btnHover'/>
        </div>
               
        <img src={tools} className={classnames({
          hiden: this.state.tools,
          'btnHover': true
        })} alt="" onClick={this.showTools}/>
      </div>
    )
  }
}
Tools.propTypes = {
  map: PropType.object
}
const mapStateToProps = (state) => {
  return {
    map: state.map
  }
}
export default connect(mapStateToProps)(Tools)