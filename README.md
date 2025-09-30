# Here are your Instructions
*Backend Installing Dependencies
    1. Create a virtual environment using python
        python3 -m venv myenv
    2. Activate the venv
        source myenv/bin/activate (on Linux/macOS) or .\myenv\Scripts\activate (on Windows)
    3. Then install deps
        pip install -r requirements.txt or pip3 install -r requirements.txt 
*Frontend Installing Dependencies
    1. npm i ***if error occurs use --legacy-peer-deps
        ****Configure legacy-peer-deps globall: set this configuration globally for all future npm installs.
                npm config set legacy-peer-deps true
                npm update
                npm cache clean --force
                rm -rf node_modules
                rm package-lock.json
                npm install