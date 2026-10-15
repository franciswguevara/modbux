import { describe, expect, it } from 'vitest'
import { decodeRegisterText } from '../text'

describe('register text preview', () => {
  it('decodes both bytes in displayed HEX order, including lowercase hex', () => {
    expect(decodeRegisterText('4849')).toBe('HI')
    expect(decodeRegisterText('6948')).toBe('iH')
    expect(decodeRegisterText('7a21')).toBe('z!')
  })

  it('preserves spaces and exposes null, control and non-ASCII bytes', () => {
    expect(decodeRegisterText('2020')).toBe('  ')
    expect(decodeRegisterText('4100')).toBe('A\\x00')
    expect(decodeRegisterText('0a7f')).toBe('\\x0A\\x7F')
    expect(decodeRegisterText('c3a9')).toBe('\\xC3\\xA9')
    expect(decodeRegisterText('5c41')).toBe('\\\\A')
  })

  it('leaves missing or malformed register values blank', () => {
    for (const hex of ['', '41', '414243', 'zzzz', '0x41', ' 41 ']) {
      expect(decodeRegisterText(hex)).toBe('')
    }
  })
})
