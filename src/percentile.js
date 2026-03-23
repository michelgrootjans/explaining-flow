function percentile(values, p) {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil(p * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}

module.exports = { percentile };
