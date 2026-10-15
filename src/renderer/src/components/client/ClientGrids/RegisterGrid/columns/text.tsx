import { GridColDef } from '@mui/x-data-grid/models'
import { RegisterData } from '@shared'

// Decode exactly the two bytes shown in HEX, in their displayed order.
// Escapes preserve padding, control bytes and non-ASCII data without guessing
// an encoding or combining bytes from unrelated register addresses.
export const decodeRegisterText = (hex: string): string => {
  if (!/^[0-9a-f]{4}$/i.test(hex)) return ''
  return [hex.slice(0, 2), hex.slice(2, 4)]
    .map((pair) => {
      const byte = parseInt(pair, 16)
      if (byte === 0x5c) return '\\\\'
      return byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : `\\x${pair.toUpperCase()}`
    })
    .join('')
}

export const textColumn: GridColDef<RegisterData, string> = {
  field: 'decodedText',
  headerName: 'Text (ASCII)',
  description:
    'Two bytes per register, in HEX order. Non-ASCII/control bytes use \\xNN; backslashes are doubled. For longer strings, select the utf8 data type.',
  width: 140,
  editable: false,
  valueGetter: (_, row) => (row.error ? '' : decodeRegisterText(row.hex)),
  renderCell: ({ value }) => (
    <span title={value} style={{ whiteSpace: 'pre' }}>
      {value}
    </span>
  )
}
