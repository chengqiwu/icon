// 39
// const ip = '39.104.186.71'
// const sql = '39.104.186.71'
// const port = '80'
// 47
// const ip = '47.104.81.112'
// const sql = '47.104.81.112'
// const port = '8080'
// const ip = '192.168.1.23'
// 112
const id = '112'
const ip = `192.168.1.${id}`
const sql = `192.168.1.${id}`
const port = '8080'
export const geoserverUrl = `http://${sql}:${port}/geoserver/ican/ows`
export const apiUrl = `http://${ip}:${port}/ican_n`
export const codeUrl = `http://${ip}:${port}/ican_n/api/user/getVerifyCodeImage?timestamp=`
export const videoUrl = `http://${ip}:${port}/video.mp4`