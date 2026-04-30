import os
import subprocess

def resolve_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<<<<<<< Updated upstream' not in content:
            return
        
        lines = content.split('\n')
        new_lines = []
        state = 'normal'
        
        for line in lines:
            if line.startswith('<<<<<<< Updated upstream'):
                state = 'upstream'
                continue
            elif line.startswith('======='):
                state = 'stashed'
                continue
            elif line.startswith('>>>>>>> Stashed changes') or line.startswith('>>>>>>> '):
                state = 'normal'
                continue
                
            if state == 'normal' or state == 'upstream':
                new_lines.append(line)
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"Resolved {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    result = subprocess.run(['grep', '-rl', '<<<<<<< Updated upstream', '.'], capture_output=True, text=True)
    files = result.stdout.strip().split('\n')
    for f in files:
        if f and not f.endswith('resolve.py'):
            resolve_file(f)

if __name__ == "__main__":
    main()
