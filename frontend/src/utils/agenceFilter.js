// Resolve a record's effective agency
export const inferAgence = (record) => {
    if (!record) return null;
  
    // 1. Explicit agence on the record
    const explicit = (record.agence || '').trim().toUpperCase();
    if (['LILLE', 'LENS', 'VALENCIENNES'].includes(explicit)) {
      return explicit;
    }
  
    // 2. Postal code inference
    const cp = String(record.code_postal || record.codepostal || '')
      .trim()
      .replace(/\s/g, '');
    if (cp.startsWith('59')) return 'LILLE';
    if (cp.startsWith('62')) return 'LENS';
  
    return null;
  };
  
  // Does this record belong to one of the allowed agences?
  export const matchesAgence = (record, allowedAgences) => {
    if (!record) return false;
    const agence = inferAgence(record);
    return agence && allowedAgences.includes(agence);
  };
  
  // Filter records by allowed agences; optionally check a nested field
  export const filterByAgence = (records, allowedAgences, nestedField = null) => {
    if (!Array.isArray(records)) return [];
  
    return records.filter((r) => {
      // Check the record directly
      if (matchesAgence(r, allowedAgences)) return true;
  
      // Check a nested field (e.g. contrat.lead)
      if (nestedField) {
        const nested = r[nestedField];
        if (nested && typeof nested === 'object') {
          return matchesAgence(nested, allowedAgences);
        }
      }
  
      return false;
    });
  };