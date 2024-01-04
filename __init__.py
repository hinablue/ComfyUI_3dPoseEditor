# Title: ComfyUI Install Customs Nodes and javascript files
# Author: Hina Chen
# Version: 2023.11.30

import os
import filecmp
import shutil

import __main__

from distutils.dir_util import copy_tree
from .poseEditor3D_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

WEB_DIRECTORY = "./web"

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY']

# # ComfyUI folders web
# folder_web = os.path.join(os.path.dirname(os.path.realpath(__main__.__file__)), "web")
# extensions_folder = os.path.join(folder_web, 'extensions', 'ComfyUI_3dPoseEditor')
# web_folder = os.path.join(extensions_folder, 'web')
# assets_folder = os.path.join(extensions_folder, 'assets')
# webSource_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")
# assetsSource_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), "assets")

# def update_web():
#     if os.path.exists(extensions_folder):
#         shutil.rmtree(extensions_folder)

#     print("[3D OpenPose Editor] Creating frontend extension folder: " + extensions_folder)
#     os.mkdir(extensions_folder)

#     print('[3D OpenPose Editor] Copy web folder')
#     if os.path.exists(web_folder):
#         shutil.rmtree(web_folder)
#     copy_tree(webSource_folder, web_folder)

#     print('[3D OpenPose Editor] Copy assets folder')
#     if os.path.exists(assets_folder):
#         shutil.rmtree(assets_folder)
#     copy_tree(assetsSource_folder, assets_folder)

# update_web()

print('\033[34m3D OpenPose Editor: \033[92mLoaded\033[0m')
