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
                    }
                });
            });
        </script>"""

# Find all HTML files
files = glob.glob('pages/carreras/*.html') + glob.glob('pages/*.html')

count = 0
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'Mobile dropdown toggle' in content:
        continue  # Already has it
    
    # Find the closing </body> tag and insert before it
    if '</body>' in content:
        content = content.replace('</body>', DROPDOWN_JS + '\n    </body>')
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'OK: {fpath}')

print(f'\nUpdated {count} files')
