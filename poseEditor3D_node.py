import hashlib
import os
import json
import base64
from server import PromptServer
from aiohttp import web
from PIL import Image, ImageOps
import torch
import numpy as np
import folder_paths

# Directory node save settings
CHUNK_SIZE = 1024
dir_painter_node = os.path.dirname(__file__)
extension_path = os.path.join(os.path.abspath(dir_painter_node))

class PoseEditor3D(object):
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(self):
        temp_dir = folder_paths.get_temp_directory()
        temp_dir = os.path.join(temp_dir, '3dposeeditor')

        if not os.path.isdir(temp_dir):
            os.makedirs(temp_dir)

        return {
            "required": {},
            "optional": {
                "pose": (sorted(os.listdir(temp_dir)), ),
                "depth": (sorted(os.listdir(temp_dir)), ),
                "normal": (sorted(os.listdir(temp_dir)), ),
                "canny": (sorted(os.listdir(temp_dir)), ),
            },
        }

    RETURN_TYPES = ("IMAGE","IMAGE","IMAGE","IMAGE",)
    RETURN_NAMES = ("OpenPose", "Depth", "Normal", "Canny",)
    FUNCTION = "output_pose"

    CATEGORY = "image"

    def output_pose(self, pose=None, depth=None, normal=None, canny=None):
        if pose is None:
            return (None, None, None, None,)

        temp_dir = folder_paths.get_temp_directory()
        temp_dir = os.path.join(temp_dir, '3dposeeditor')

        image_path = os.path.join(temp_dir, pose)

        i = Image.open(image_path)
        poseImage = i.convert("RGB")
        poseImage = np.array(poseImage).astype(np.float32) / 255.0
        poseImage = torch.from_numpy(poseImage)[None,]

        image_path = os.path.join(temp_dir, depth)

        i = Image.open(image_path)
        depthImage = i.convert("RGB")
        depthImage = np.array(depthImage).astype(np.float32) / 255.0
        depthImage = torch.from_numpy(depthImage)[None,]

        image_path = os.path.join(temp_dir, normal)

        i = Image.open(image_path)
        normalImage = i.convert("RGB")
        normalImage = np.array(normalImage).astype(np.float32) / 255.0
        normalImage = torch.from_numpy(normalImage)[None,]

        image_path = os.path.join(temp_dir, canny)

        i = Image.open(image_path)
        cannyImage = i.convert("RGB")
        cannyImage = np.array(cannyImage).astype(np.float32) / 255.0
        cannyImage = torch.from_numpy(cannyImage)[None,]

        return (poseImage, depthImage, normalImage, cannyImage,)

    @staticmethod
    def IS_CHANGED(self, pose=None, depth=None, normal=None, canny=None):
        if pose is None:
            return False

        temp_dir = folder_paths.get_temp_directory()
        temp_dir = os.path.join(temp_dir, '3dposeeditor')

        image_path = os.path.join(temp_dir, pose)
        # print(f'Change: {image_path}')

        m = hashlib.sha256()
        with open(image_path, 'rb') as f:
            m.update(f.read())
        return m.digest().hex()

NODE_CLASS_MAPPINGS = {
    "Hina.PoseEditor3D": PoseEditor3D
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "Hina.PoseEditor3D": "3D Pose Editor"
}