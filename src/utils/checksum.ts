import {keccak256} from 'viem'
// JSON spec does not allow undefined so stringify removes the prop
// That's a problem for calculating the checksum back so this function avoid the issue
export const stringifyReplacer = (_: string, value: any) => (value === undefined ? null : value)

const serializeJSONObject = (json: any): string => {
  if (Array.isArray(json)) {
    return `[${json.map(el => serializeJSONObject(el)).join(',')}]`
  }

  if (typeof json === 'object' && json !== null) {
    let acc = ''
    const keys = Object.keys(json).sort()
    acc += `{${JSON.stringify(keys, stringifyReplacer)}`

    for (let i = 0; i < keys.length; i++) {
      acc += `${serializeJSONObject(json[keys[i]])},`
    }

    return `${acc}}`
  }

  return `${JSON.stringify(json, stringifyReplacer)}`
}

const calculateChecksum = (batchFile: any): string | undefined => {
  const serialized = serializeJSONObject({
    ...batchFile,
    meta: { ...batchFile.meta, name: null },
  })
  const sha = keccak256(new Uint8Array(Buffer.from(serialized, 'utf8')
  ))

  return sha || undefined
}

export const addChecksum = (batchFile: any): any => {
  return {
    ...batchFile,
    meta: {
      ...batchFile.meta,
      checksum: calculateChecksum(batchFile),
    },
  }
}

export const downloadObjectAsJson = (batchFile: any) => {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(batchFile, stringifyReplacer))
  const downloadAnchorNode = document.createElement('a')

  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', batchFile.meta.name + '.json')
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
