/**
 * RspProtocol Tests
 * Tests for GDB Remote Serial Protocol packet encoding/decoding
 */

import { RspProtocol } from '../../../lib/gdb/RspProtocol';
import { GDB_PACKETS, SAMPLE_MEMORY } from '../../fixtures/testData';
import { createMockPacket, bytesToHex, hexToBytes } from '../../utils/testHelpers';

describe('RspProtocol', () => {
  describe('Checksum Calculation', () => {
    it('should calculate correct checksum for simple command', () => {
      const checksum = RspProtocol.calculateChecksum('qSupported');
      expect(checksum).toBe('37');
    });

    it('should calculate checksum for OK response', () => {
      const checksum = RspProtocol.calculateChecksum('OK');
      expect(checksum).toBe('9a');
    });

    it('should calculate checksum for empty string', () => {
      const checksum = RspProtocol.calculateChecksum('');
      expect(checksum).toBe('00');
    });

    it('should verify valid checksum', () => {
      const data = 'qSupported';
      const checksum = RspProtocol.calculateChecksum(data);
      const isValid = RspProtocol.verifyChecksum(data, checksum);
      expect(isValid).toBe(true);
    });

    it('should reject invalid checksum', () => {
      const data = 'qSupported';
      const isValid = RspProtocol.verifyChecksum(data, 'ff');
      expect(isValid).toBe(false);
    });

    it('should handle case-insensitive checksum comparison', () => {
      const data = 'qSupported';
      const checksum = RspProtocol.calculateChecksum(data).toUpperCase();
      const isValid = RspProtocol.verifyChecksum(data, checksum.toLowerCase());
      expect(isValid).toBe(true);
    });
  });

  describe('Packet Encoding', () => {
    it('should encode simple command', () => {
      const packet = RspProtocol.encodePacket('?');
      expect(packet).toMatch(/^\$\?#[0-9a-f]{2}$/);
      expect(packet).toBe('$?#3f');
    });

    it('should encode qSupported command', () => {
      const packet = RspProtocol.encodePacket('qSupported');
      expect(packet).toBe('$qSupported#37');
    });

    it('should encode memory read command', () => {
      const packet = RspProtocol.encodePacket('m0,10');
      expect(packet).toMatch(/^\$m0,10#[0-9a-f]{2}$/);
    });

    it('should include correct checksum in encoded packet', () => {
      const packet = RspProtocol.encodePacket('g');
      const match = packet.match(/\$(.+)#(.+)/);
      expect(match).not.toBeNull();
      if (match) {
        const [_, data, checksum] = match;
        const calculatedChecksum = RspProtocol.calculateChecksum(data);
        expect(checksum).toBe(calculatedChecksum);
      }
    });
  });

  describe('Packet Decoding', () => {
    it('should decode valid packet', () => {
      const decoded = RspProtocol.decodePacket('$OK#9a');
      expect(decoded).not.toBeNull();
      expect(decoded?.data).toBe('OK');
      expect(decoded?.checksum).toBe('9a');
    });

    it('should decode ACK', () => {
      const decoded = RspProtocol.decodePacket('+');
      expect(decoded).not.toBeNull();
      expect(decoded?.data).toBe('+');
    });

    it('should decode NAK', () => {
      const decoded = RspProtocol.decodePacket('-');
      expect(decoded).not.toBeNull();
      expect(decoded?.data).toBe('-');
    });

    it('should reject packet with invalid checksum', () => {
      const decoded = RspProtocol.decodePacket('$OK#ff');
      expect(decoded).toBeNull();
    });

    it('should reject packet without dollar sign', () => {
      const decoded = RspProtocol.decodePacket('OK#9a');
      expect(decoded).toBeNull();
    });

    it('should reject packet without checksum', () => {
      const decoded = RspProtocol.decodePacket('$OK');
      expect(decoded).toBeNull();
    });

    it('should handle hex checksum correctly', () => {
      const packet = '$E01#a6';
      const decoded = RspProtocol.decodePacket(packet);
      expect(decoded).not.toBeNull();
      expect(decoded?.data).toBe('E01');
    });
  });

  describe('Response Parsing', () => {
    it('should parse OK response', () => {
      const response = RspProtocol.parseResponse('OK');
      expect(response.type).toBe('ok');
    });

    it('should parse error response', () => {
      const response = RspProtocol.parseResponse('E01');
      expect(response.type).toBe('error');
      expect(response.code).toBe('01');
    });

    it('should parse signal response (S format)', () => {
      const response = RspProtocol.parseResponse('S05');
      expect(response.type).toBe('signal');
      expect(response.signal).toBe(5);
    });

    it('should parse stop reply (T format)', () => {
      const response = RspProtocol.parseResponse('T05');
      expect(response.type).toBe('signal');
      expect(response.signal).toBe(5);
    });

    it('should parse ACK response', () => {
      const response = RspProtocol.parseResponse('+');
      expect(response.type).toBe('ack');
    });

    it('should parse NAK response', () => {
      const response = RspProtocol.parseResponse('-');
      expect(response.type).toBe('nak');
    });

    it('should parse empty response', () => {
      const response = RspProtocol.parseResponse('');
      expect(response.type).toBe('empty');
    });

    it('should parse data response', () => {
      const response = RspProtocol.parseResponse('abcdef');
      expect(response.type).toBe('data');
      expect(response.data).toBe('abcdef');
    });
  });

  describe('Binary Data Escaping', () => {
    it('should escape dollar sign', () => {
      const escaped = RspProtocol.escapeBinaryData('$');
      expect(escaped).toBe('}' + String.fromCharCode(0x24 ^ 0x20));
    });

    it('should escape hash character', () => {
      const escaped = RspProtocol.escapeBinaryData('#');
      expect(escaped).toBe('}' + String.fromCharCode(0x23 ^ 0x20));
    });

    it('should escape escape character', () => {
      const escaped = RspProtocol.escapeBinaryData('}');
      expect(escaped).toBe('}' + String.fromCharCode(0x7d ^ 0x20));
    });

    it('should escape asterisk', () => {
      const escaped = RspProtocol.escapeBinaryData('*');
      expect(escaped).toBe('}' + String.fromCharCode(0x2a ^ 0x20));
    });

    it('should not escape regular characters', () => {
      const escaped = RspProtocol.escapeBinaryData('Hello');
      expect(escaped).toBe('Hello');
    });

    it('should escape mixed data', () => {
      const data = 'test$value';
      const escaped = RspProtocol.escapeBinaryData(data);
      expect(escaped).toContain('test');
      expect(escaped).toContain('value');
      expect(escaped).toContain('}');
    });
  });

  describe('Binary Data Unescaping', () => {
    it('should unescape escaped dollar sign', () => {
      const escaped = RspProtocol.escapeBinaryData('$');
      const unescaped = RspProtocol.unescapeBinaryData(escaped);
      expect(unescaped).toBe('$');
    });

    it('should unescape escaped characters', () => {
      const original = '$#}*';
      const escaped = RspProtocol.escapeBinaryData(original);
      const unescaped = RspProtocol.unescapeBinaryData(escaped);
      expect(unescaped).toBe(original);
    });

    it('should handle unescaped data', () => {
      const unescaped = RspProtocol.unescapeBinaryData('Hello');
      expect(unescaped).toBe('Hello');
    });

    it('should handle incomplete escape sequence at end', () => {
      const unescaped = RspProtocol.unescapeBinaryData('test}');
      expect(unescaped.startsWith('test')).toBe(true);
    });
  });

  describe('Hex Conversion', () => {
    it('should convert hex string to bytes', () => {
      const bytes = RspProtocol.hexToBytes('48656c6c6f');
      expect(bytes).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it('should convert bytes to hex string', () => {
      const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const hex = RspProtocol.bytesToHex(bytes);
      expect(hex).toBe('48656c6c6f');
    });

    it('should handle empty byte array', () => {
      const hex = RspProtocol.bytesToHex(new Uint8Array(0));
      expect(hex).toBe('');
    });

    it('should handle single byte', () => {
      const bytes = new Uint8Array([0xff]);
      const hex = RspProtocol.bytesToHex(bytes);
      expect(hex).toBe('ff');
    });

    it('should pad hex values with leading zeros', () => {
      const bytes = new Uint8Array([0x01, 0x0f]);
      const hex = RspProtocol.bytesToHex(bytes);
      expect(hex).toBe('010f');
    });

    it('should round-trip through hex conversion', () => {
      const original = new Uint8Array([0x00, 0x01, 0x7f, 0xff]);
      const hex = RspProtocol.bytesToHex(original);
      const converted = RspProtocol.hexToBytes(hex);
      expect(converted).toEqual(original);
    });
  });

  describe('Memory Encoding/Decoding', () => {
    it('should encode memory write command', () => {
      const data = new Uint8Array([0x01, 0x02, 0x03]);
      const cmd = RspProtocol.encodeMemoryWrite('1000', data);
      expect(cmd).toBe('M1000,3:010203');
    });

    it('should encode memory read command', () => {
      const cmd = RspProtocol.encodeMemoryRead('1000', 16);
      expect(cmd).toBe('m1000,10');
    });

    it('should parse memory read response', () => {
      const response = '48656c6c6f';
      const bytes = RspProtocol.parseMemoryData(response);
      expect(bytes).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it('should handle empty memory read response', () => {
      const bytes = RspProtocol.parseMemoryData('');
      expect(bytes.length).toBe(0);
    });
  });

  describe('Packet Extraction', () => {
    it('should extract single packet from buffer', () => {
      const buffer = '$OK#9a';
      const { packets, remaining } = RspProtocol.extractPackets(buffer);
      expect(packets).toHaveLength(1);
      expect(packets[0]).toBe('$OK#9a');
      expect(remaining).toBe('');
    });

    it('should extract ACK from buffer', () => {
      const buffer = '+';
      const { packets, remaining } = RspProtocol.extractPackets(buffer);
      expect(packets).toHaveLength(1);
      expect(packets[0]).toBe('+');
      expect(remaining).toBe('');
    });

    it('should extract multiple packets from buffer', () => {
      const buffer = '$OK#9a+$E01#a6';
      const { packets, remaining } = RspProtocol.extractPackets(buffer);
      expect(packets.length).toBeGreaterThanOrEqual(1);
      expect(packets[0]).toBe('$OK#9a');
    });

    it('should handle incomplete packet', () => {
      const buffer = '$OK';
      const { packets, remaining } = RspProtocol.extractPackets(buffer);
      expect(packets.length).toBe(0);
      expect(remaining).toBe('$OK');
    });

    it('should extract ACK followed by packet', () => {
      const buffer = '+$OK#9a';
      const { packets, remaining } = RspProtocol.extractPackets(buffer);
      expect(packets.length).toBeGreaterThanOrEqual(1);
      expect(packets[0]).toBe('+');
    });

    it('should handle trailing data', () => {
      const buffer = '$OK#9a$';
      const { packets, remaining } = RspProtocol.extractPackets(buffer);
      expect(packets[0]).toBe('$OK#9a');
      expect(remaining).toBe('$');
    });
  });

  describe('Stop Reply Parsing', () => {
    it('should parse basic stop reply', () => {
      const reply = RspProtocol.parseStopReply('T05');
      expect(reply.signal).toBe(5);
      expect(Object.keys(reply.info).length).toBe(0);
    });

    it('should parse stop reply with thread info', () => {
      const reply = RspProtocol.parseStopReply('T0501:abc123;');
      expect(reply.signal).toBe(5);
      expect(reply.info['01']).toBe('abc123');
    });

    it('should parse stop reply with multiple info fields', () => {
      const reply = RspProtocol.parseStopReply('T0501:abc;02:def;');
      expect(reply.signal).toBe(5);
      expect(reply.info['01']).toBe('abc');
      expect(reply.info['02']).toBe('def');
    });

    it('should handle stop reply without info', () => {
      const reply = RspProtocol.parseStopReply('T03');
      expect(reply.signal).toBe(3);
      expect(Object.keys(reply.info).length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should roundtrip packet encoding/decoding', () => {
      const command = 'qSupported';
      const encoded = RspProtocol.encodePacket(command);
      const decoded = RspProtocol.decodePacket(encoded);
      expect(decoded?.data).toBe(command);
    });

    it('should handle memory data with special characters', () => {
      const data = SAMPLE_MEMORY.withSpecialChars;
      const hex = RspProtocol.bytesToHex(data);
      const decoded = RspProtocol.hexToBytes(hex);
      expect(decoded).toEqual(data);
    });
  });
});
