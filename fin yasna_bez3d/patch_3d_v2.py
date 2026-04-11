#!/usr/bin/env python3
"""Replace the old 3D code block with the new v2 3D code."""

with open('/home/ubuntu/yasna_3d/index.html', 'r') as f:
    html = f.read()

with open('/home/ubuntu/yasna_3d/three_code_v2.js', 'r') as f:
    new_code = f.read()

# Find the old 3D code block
marker_start = '// ═══════════════════════════════════════════\n// ══ 3D VIEW (Three.js) ═══════════════════\n// ═══════════════════════════════════════════'
marker_end = '</script>\n</body>\n</html>'

idx_start = html.find(marker_start)
idx_end = html.find(marker_end)

if idx_start == -1:
    print("ERROR: Could not find start marker")
    exit(1)
if idx_end == -1:
    print("ERROR: Could not find end marker")
    exit(1)

# Replace old 3D code with new code
new_html = html[:idx_start] + new_code + '\n\n' + marker_end
    
with open('/home/ubuntu/yasna_3d/index.html', 'w') as f:
    f.write(new_html)

print(f"SUCCESS: Replaced 3D code ({idx_end - idx_start} chars old -> {len(new_code)} chars new)")
print(f"Total file size: {len(new_html)} chars")
