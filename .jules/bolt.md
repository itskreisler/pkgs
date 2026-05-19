## 2025-05-14 - [Buffer Accumulation Optimization]
**Learning:** Using `Buffer.concat` in a loop to accumulate stream data leads to $O(n^2)$ complexity because each call re-allocates a new buffer and copies all previous data.
**Action:** Always accumulate stream chunks in an array and use a single `Buffer.concat` at the end to achieve $O(n)$ performance.
