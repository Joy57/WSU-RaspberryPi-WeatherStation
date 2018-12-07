# -*- mode: python -*-
import shutil

block_cipher = None

a = Analysis(['weatherstation.py'],
             pathex=['/home/pi/dev/weather-station-site/client'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='weatherstation',
          debug=False,
          strip=False,
          upx=True,
          runtime_tmpdir=None,
          console=True )

shutil.copyfile('binaryUtils/setup.py', '{0}/setup.py'.format(DISTPATH))
shutil.copyfile('binaryUtils/install.txt', '{0}/install.txt'.format(DISTPATH))
shutil.copyfile('config.yaml', '{0}/config.yaml'.format(DISTPATH))
