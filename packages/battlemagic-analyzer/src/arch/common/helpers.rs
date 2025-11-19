/// Common binary reading helper functions

/// Read u32 in little endian from byte slice
#[inline]
pub fn read_u32_le(data: &[u8], offset: usize) -> u32 {
    if offset + 4 > data.len() {
        return 0;
    }
    u32::from_le_bytes([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]])
}

/// Read u32 in big endian from byte slice
#[inline]
pub fn read_u32_be(data: &[u8], offset: usize) -> u32 {
    if offset + 4 > data.len() {
        return 0;
    }
    u32::from_be_bytes([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]])
}

/// Read u16 in little endian from byte slice
#[inline]
pub fn read_u16_le(data: &[u8], offset: usize) -> u16 {
    if offset + 2 > data.len() {
        return 0;
    }
    u16::from_le_bytes([data[offset], data[offset + 1]])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_u32_le() {
        let data = vec![0x01, 0x02, 0x03, 0x04];
        assert_eq!(read_u32_le(&data, 0), 0x0403_0201);
    }

    #[test]
    fn test_read_u32_be() {
        let data = vec![0x01, 0x02, 0x03, 0x04];
        assert_eq!(read_u32_be(&data, 0), 0x0102_0304);
    }
}
