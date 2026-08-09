declare module "bencode" {
  interface Bencode {
    decode(data: Uint8Array, encoding?: string): unknown
    encode(value: unknown): Uint8Array
    byteLength(value: unknown): number
    encodingLength(value: unknown): number
  }

  const bencode: Bencode
  export default bencode
}
