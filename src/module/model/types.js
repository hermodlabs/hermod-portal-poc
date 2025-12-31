/**
 * @typedef {{ x:number, y:number }} Point
 * @typedef {{ w:number, h:number, z:number, tMin:number, doorIntensity:number, fanMix:number, seed:number }} FieldSimParams
 * @typedef {{ grid:number[][], door:Point, doorPulse:number }} FieldSimResult
 *
 * @typedef {{ min:number, max:number, avg:number }} GridSummary
 * @typedef {{ low?:number, high?:number }} AlertThresholds
 * @typedef {{ x:number, y:number, v:number }} AlertPoint
 * @typedef {{ low:AlertPoint[], high:AlertPoint[] }} AlertResult
 *
 * @typedef {{ t:string, avg:number, min:number, max:number }} TimeseriesPoint
 * @typedef {{ id:string, type:string, when:string, durationSec:number, severity:number, note:string }} EventItem
 */
export {};
