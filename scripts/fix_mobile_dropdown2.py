import os, glob

DROPDOWN_JS = """
        <script>
            // Mobile dropdown toggle
            document.querySelectorAll('.nav .dropdown > a').forEach(link => {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        const li = this.parentElement;
                        document.querySelectorAll('.nav .dropdown.active').forEach(d => {
                            if (d !== li) d.classList.remove('active');
                        });
                        li.classList.toggle('active');
                        var grid = li.querySelector('.careers-grid-3col');
                        if (grid && li.classList.contains('active')) {
                            grid.style.gridTemplateColumns = '1fr';
                            grid.style.gap = '0';
                        }
                    }
                });
            });
            var menuBtn = document.querySelector('.mobile-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', function() {
                    setTimeout(function() {
                        if (window.innerWidth <= 768) {
                            document.querySelectorAll('.careers-grid-3col').forEach(function(g) {
                                g.style.gridTemplateColumns = '1fr';
                                g.style.gap = '0';
                            });
                        }
                    }, 100);
                });
            }
        </script>"""

files = glob.glob('pages/carreras/*.html') + glob.glob('pages/*.html')

count = 0
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the old dropdown JS block
    # Look for the pattern: <script>\n            // Mobile dropdown toggle\n ... </script>
    import re
    pattern = r'<script>\s*//\s*Mobile dropdown toggle.*?</script>'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        content = content[:match.start()] + DROPDOWN_JS + content[match.end():]
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'OK: {fpath}')
    else:
        print(f'SKIP (no match): {fpath}')

print(f'\nUpdated {count} files')
