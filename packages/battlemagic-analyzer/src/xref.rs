//! Generic cross-reference database
//!
//! This module provides a pure data structure for storing and querying
//! cross-references. It is architecture-agnostic - all architecture-specific
//! logic has been moved to the Architecture trait implementations.

use crate::types::{CrossReference, XrefType};
use std::collections::HashMap;

/// Cross-reference database for efficient xref lookups
///
/// This is a pure data structure with no architecture-specific logic.
/// All parsing and xref extraction is handled by Architecture implementations.
///
/// # Performance
/// - Adding xrefs: O(1)
/// - Building indices: O(N)
/// - Querying xrefs: O(1) average case
pub struct XrefDatabase {
    /// All cross-references stored in insertion order
    xrefs: Vec<CrossReference>,

    /// Index for lookups by target address: target_addr -> xref_indices
    to_index: HashMap<u32, Vec<usize>>,

    /// Index for lookups by source address: source_addr -> xref_indices
    from_index: HashMap<u32, Vec<usize>>,

    /// Whether indices have been built
    indices_built: bool,
}

impl XrefDatabase {
    /// Create a new empty xref database
    pub fn new() -> Self {
        Self {
            xrefs: Vec::new(),
            to_index: HashMap::new(),
            from_index: HashMap::new(),
            indices_built: false,
        }
    }

    /// Create with pre-allocated capacity
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            xrefs: Vec::with_capacity(capacity),
            to_index: HashMap::new(),
            from_index: HashMap::new(),
            indices_built: false,
        }
    }

    /// Add a cross-reference to the database
    ///
    /// Note: Indices are not automatically updated. Call `build_indices()`
    /// after adding all xrefs to enable fast lookups.
    pub fn add_xref(
        &mut self,
        from_addr: u32,
        to_addr: u32,
        xref_type: XrefType,
        instruction: &str,
        operands: &str,
    ) {
        let xref = CrossReference::new(
            from_addr,
            to_addr,
            xref_type,
            instruction.to_string(),
            operands.to_string(),
        );
        self.xrefs.push(xref);
        self.indices_built = false; // Invalidate indices
    }

    /// Build indices for fast lookups
    ///
    /// This must be called after adding all xrefs and before querying.
    /// Rebuilds both to_index and from_index HashMaps.
    pub fn build_indices(&mut self) {
        self.to_index.clear();
        self.from_index.clear();

        for (idx, xref) in self.xrefs.iter().enumerate() {
            // Index by target address
            self.to_index
                .entry(xref.to_addr)
                .or_default()
                .push(idx);

            // Index by source address
            self.from_index
                .entry(xref.from_addr)
                .or_default()
                .push(idx);
        }

        self.indices_built = true;
    }

    /// Get all cross-references targeting a specific address
    pub fn get_xrefs_to(&self, address: u32) -> Vec<CrossReference> {
        if let Some(indices) = self.to_index.get(&address) {
            indices.iter().map(|&i| self.xrefs[i].clone()).collect()
        } else {
            Vec::new()
        }
    }

    /// Get all cross-references originating from a specific address
    pub fn get_xrefs_from(&self, address: u32) -> Vec<CrossReference> {
        if let Some(indices) = self.from_index.get(&address) {
            indices.iter().map(|&i| self.xrefs[i].clone()).collect()
        } else {
            Vec::new()
        }
    }

    /// Get all cross-references in the database
    pub fn get_all_xrefs(&self) -> &Vec<CrossReference> {
        &self.xrefs
    }

    /// Get the total number of cross-references
    pub fn count(&self) -> usize {
        self.xrefs.len()
    }

    /// Check if indices have been built
    pub fn has_indices(&self) -> bool {
        self.indices_built
    }

    /// Clear all xrefs and indices
    pub fn clear(&mut self) {
        self.xrefs.clear();
        self.to_index.clear();
        self.from_index.clear();
        self.indices_built = false;
    }

    /// Convert database into vector of xrefs
    pub fn into_vec(self) -> Vec<CrossReference> {
        self.xrefs
    }
}

impl Default for XrefDatabase {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_creation() {
        let db = XrefDatabase::new();
        assert_eq!(db.count(), 0);
        assert!(!db.has_indices());
    }

    #[test]
    fn test_add_xref() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");

        assert_eq!(db.count(), 1);
        assert!(!db.has_indices()); // Not built yet
    }

    #[test]
    fn test_build_indices() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.add_xref(0x1004, 0x2000, XrefType::Call, "bl", "#0x2000");

        db.build_indices();
        assert!(db.has_indices());

        // Test xrefs_to
        let xrefs_to = db.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to.len(), 2);

        // Test xrefs_from
        let xrefs_from = db.get_xrefs_from(0x1000);
        assert_eq!(xrefs_from.len(), 1);
        assert_eq!(xrefs_from[0].to_addr, 0x2000);
    }

    #[test]
    fn test_query_nonexistent() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.build_indices();

        let xrefs = db.get_xrefs_to(0x9999);
        assert_eq!(xrefs.len(), 0);
    }

    #[test]
    fn test_clear() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.build_indices();

        db.clear();
        assert_eq!(db.count(), 0);
        assert!(!db.has_indices());
    }

    #[test]
    fn test_multiple_xrefs_same_target() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.add_xref(0x1004, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.add_xref(0x1008, 0x2000, XrefType::Branch, "b", "#0x2000");

        db.build_indices();

        let xrefs_to = db.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to.len(), 3);

        // Count by type
        let calls = xrefs_to.iter().filter(|x| x.xref_type == XrefType::Call).count();
        let branches = xrefs_to.iter().filter(|x| x.xref_type == XrefType::Branch).count();

        assert_eq!(calls, 2);
        assert_eq!(branches, 1);
    }
}
