import { app } from "/scripts/app.js"

class OpenPoseEditor {
    constructor(node, container) {
        this.node = node
        this.images = node.widgets.filter(w => ['pose','depth','normal','canny'].indexOf(w.name)> -1)

        this.iframe =  document.createElement('iframe')
        this.iframe.src = '/extensions/ComfyUI_3dPoseEditor/editor.html'
        container.appendChild(this.iframe)
    }

    async uploadPoseFile(imageData) {
        for (let type in imageData) {
            const blobData = await fetch(imageData[type]).then(r => r.blob())
            const filename = `${this.node.name}_${type}.png`

            const image = this.images[this.images.findIndex(i => i.name === type)]

            let formData = new FormData()
            formData.append('image', blobData, filename)
            formData.append('overwrite', 'true')
            formData.append('type', 'temp')
            formData.append('subfolder', '3dposeeditor')

            const resp = await fetch('/upload/image', {
                method: 'POST',
                body: formData,
            })

            if (resp.status === 200) {
                const data = await resp.json()

                console.log("[3D Pose Editor] Upload image success.", data.name)

                image.options.value = data.name
                image.value = data.name
            }
        }
    }

    remove() {
        this.container.remove()
    }
}

function createOpenPoseEditor(node, inputName, inputData, app) {
    node.name = inputName

    const waitForElement = async function (parent, selector, exist) {
        return new Promise(function (resolve) {
            if (!!parent.querySelector(selector) === exist) {
                resolve(undefined)

                return
            }

            MutationObserver((mutationList, observer) => {
                if (!!parent.querySelector(selector) === exist) {
                    observer.disconnect()
                    resolve(undefined)
                }
            }).observe(parent, {
                childList: true,
                subtree: true,
            })
        })
    }

    const timeout = ms => {
        return new Promise(function (resolve, reject) {
            setTimeout(() => reject('Timeout'), ms)
        })
    }

    const postMessage = function (message) {
        node.openposeeditor?.iframe?.contentWindow?.postMessage(message, "*")
    }

    const widget = {
        type: "openposeeditor",
        name: `op3d${inputName}`,
        callback: () => {},
        draw: function (ctx, _, widgetWidth, y, widgetHeight) {
            const margin = 10
            const top_offset = 5
            const visible = app.canvas.ds.scale > 0.6 && this.type === "openposeeditor"
            const w = widgetWidth - margin * 4
            const clientRectBound = ctx.canvas.getBoundingClientRect()
            const transform = new DOMMatrix()
                .scaleSelf(
                    clientRectBound.width / ctx.canvas.width,
                    clientRectBound.height / ctx.canvas.height
                )
                .multiplySelf(ctx.getTransform())
                .translateSelf(margin, margin + y)

            Object.assign(this.openposeeditor.style, {
                left: `${transform.a * margin + transform.e}px`,
                top: `${transform.d + transform.f + top_offset}px`,
                width: `${(w * transform.a)}px`,
                height: `${(w * transform.d - widgetHeight - (margin * 15) * transform.d)}px`,
                position: "absolute",
                overflow: "hidden",
                zIndex: app.graph._nodes.indexOf(node),
            })

            Object.assign(this.openposeeditor.children[0].style, {
                transformOrigin: "50% 50%",
                width: '100%',
                height: '100%',
                border: '0 none',
            })

            this.openposeeditor.hidden = !visible
        },
        handleMessage (event) {
            const { data } = event
            if (data && data.cmd && data.cmd === 'openpose-3d' && data.method) {
                const method = data.method

                if ('MakeImages' === method) {
                    node.openposeeditor.uploadPoseFile(data.payload)
                }
            }
        }
    }

    const container = document.createElement('div')
    container.id = 'comfyui-3dopenpose-editor'

    node.openposeeditor = new OpenPoseEditor(node, container)
    widget.openposeeditor = container
    widget.parent = node

    document.body.appendChild(widget.openposeeditor)

    node.addCustomWidget(widget)

    node.onRemoved = () => {
        window.removeEventListener('message', widget.handleMessage, false)
        // When removing this node we need to remove the input from the DOM
        for (let y in node.widgets) {
            if (node.widgets[y].openposeeditor) {
                node.widgets[y].openposeeditor.remove()
            }
        }
    }

    node.onResize = function () {
        let [w, h] = this.size
        if (w <= 600) w = 600
        if (h <= 400) h = 400

        if (w > 400) {
            h = w + 20
        }

        this.size = [w, h]
    }

    widget.onRemove = () => {
        window.removeEventListener('message', widget.handleMessage, false)
        widget.openposeeditor?.remove()
    }

    node.onDrawBackground = function (ctx) {
        if (!this.flags.collapsed) {
            node.openposeeditor.iframe.hidden = false
        } else {
            node.openposeeditor.iframe.hidden = true
        }
    }

    app.canvas.onDrawBackground = function () {
        // Draw node isnt fired once the node is off the screen
        // if it goes off screen quickly, the input may not be removed
        // this shifts it off screen so it can be moved back if the node is visible.
        for (let n in app.graph._nodes) {
            n = graph._nodes[n]
            for (let w in n.widgets) {
                let wid = n.widgets[w]
                if (Object.hasOwn(wid, "openposeeditor")) {
                    wid.openposeeditor.style.left = -8000 + "px"
                    wid.openposeeditor.style.position = "absolute"
                }
            }
        }
    }

    setTimeout(() => {
        Promise.race([
            waitForElement(node.openposeeditor.iframe.contentDocument.body, "canvas", true),
            timeout(5000)
        ]).then(() => {
            postMessage({
                cmd: 'openpose-3d',
                method: 'MakeImages',
                type: 'call',
                payload: null,
            })

            node.openposeeditor.iframe.contentWindow.addEventListener('mouseup', function() {
                postMessage({
                    cmd: 'openpose-3d',
                    method: 'MakeImages',
                    type: 'call',
                    payload: null,
                })
            }, false)
        }).catch(() => {
            console.log("[3D Pose Editor] Editor initialize failed.")
        })
    }, 150)

    return {
        widget: widget,
    }
}

app.registerExtension({
    name: "Hina.PoseEditor3D",

    async init (app) {
        const style = document.createElement("style")
        style.innerText = `#comfyui-3dopenpose-editor iframe { border: 0 none; }`
        document.head.appendChild(style)
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "Hina.PoseEditor3D") {
            console.log("[3D Pose Editor] Registering node...", nodeData)

            const onNodeCreated = nodeType.prototype.onNodeCreated

            nodeType.prototype.onNodeCreated = async function() {
                const r = onNodeCreated
                    ? onNodeCreated.apply(this, arguments)
                    : undefined

                let openPoseNode = app.graph._nodes.filter(
                    (wi) => wi.type == "Hina.PoseEditor3D"
                )
                let nodeName = `OpenPoseEditor_${openPoseNode.length}`

                console.log(`[3D Pose Editor] Create PoseNode: ${nodeName}`)

                const result = await createOpenPoseEditor.apply(this, [this, nodeName, {}, app])

                window.addEventListener('message', result.widget.handleMessage, false)

                this.setSize([600, 400])

                return r
            }
        }
    },
})
