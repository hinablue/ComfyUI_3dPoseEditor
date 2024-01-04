# Title: ComfyUI Install Customs Nodes
# Author: Hina Chen
# Version: 2024.01.04

import os
import filecmp
import shutil

import __main__

from distutils.dir_util import copy_tree
from .poseEditor3D_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

WEB_DIRECTORY = "./web"

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY']

# # Cleanup old extension folder
folder_web = os.path.join(os.path.dirname(os.path.realpath(__main__.__file__)), "web")
extensions_folder = os.path.join(folder_web, 'extensions', 'ComfyUI_3dPoseEditor')

def cleanup():
    if os.path.exists(extensions_folder):
        shutil.rmtree(extensions_folder)
        print('\033[34m3D OpenPose Editor: \033[92mRemoved old extension folder\033[0m')

cleanup()

print('\033[34m3D OpenPose Editor: \033[92mLoaded\033[0m')