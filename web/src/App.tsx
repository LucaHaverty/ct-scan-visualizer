import { ChangeEvent, useRef, useState } from "react"
import Button from "@mui/material/Button"
import { Slider, Stack, Typography } from "@mui/material"
import DataParser from "./DataParser"
import SceneRenderer from "./SceneRenderer"

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement
if (!canvas) throw new Error("no canvas")

const ctx = canvas.getContext("2d")
if (!ctx) throw new Error("no ctx")

const App = () => {
    const fileUploadRef = useRef<HTMLInputElement>(null)

    // const [selectedFolder, setSelectedFolder] = useState<FileList | undefined>(
    //     undefined
    // )

    const [fileIndex, setFileIndex] = useState<number>(0)
    const [threshold, setThreshold] = useState<number[]>([0.4, 0.6])
    const [parsedData, setParsedData] = useState<number[][][] | undefined>(
        undefined
    )

    const uploadClicked = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.click()
        }
    }

    const renderImage = () => {
        if (parsedData == undefined)
            throw new Error("Parsed data should not be undefined")

        const data = parsedData[fileIndex]
        const height = data.length
        const width = data[0].length

        canvas.width = width
        canvas.height = height
        const imageData = ctx!.createImageData(width, height)
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                const index = h * width + w
                let value = data[w][h]

                value = Math.max(0, Math.min(255, value)) // Clamp to 0-255
                if (
                    value >= threshold[0] * 255 &&
                    value <= threshold[1] * 255
                ) {
                    imageData.data[index * 4] = 0
                    imageData.data[index * 4 + 1] = value
                    imageData.data[index * 4 + 2] = 255
                    imageData.data[index * 4 + 3] = 255
                } else {
                    imageData.data[index * 4] = value
                    imageData.data[index * 4 + 1] = value
                    imageData.data[index * 4 + 2] = value
                    imageData.data[index * 4 + 3] = 255
                }
            }
        }

        ctx!.putImageData(imageData, 0, 0)
    }

    if (parsedData != undefined) renderImage()

    const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
        console.log("input changed")
        if (e.target.files) {
            if (e.target.files == undefined) throw new Error("Selected folder no exist!!!")

            DataParser.parseData(e.target.files).then(data => {
                setParsedData(data)
                DataParser.PARSED_DATA = data
                console.log(DataParser.PARSED_DATA[0][250][250])
            })
        }
        else console.log("nope")
    }

    return (
        <>
            <Stack direction={"column"} maxWidth={"20vw"} alignItems="stretch">
                <input
                    ref={fileUploadRef}
                    onChange={onInputChanged}
                    type="file"
                    hidden={true}
                    {...({ directory: "true" } as any)}
                    {...({ webkitdirectory: "true" } as any)}
                    multiple
                />
                <Button variant="contained" onClick={uploadClicked}>
                    Load File
                </Button>
                {parsedData ? (
                    <>
                        <Typography>{`Loaded ${parsedData.length} files`}</Typography>
                        <Button variant="contained" onClick={renderImage}>
                            Render Image
                        </Button>
                        <Stack
                            direction={"column"}
                            alignItems="stretch"
                            spacing=""
                        >
                            <Button variant="contained" onClick={() => {
                                SceneRenderer.renderScan()
                            }}>
                                Generate Model
                            </Button>
                            <Slider
                                getAriaLabel={()=>"Volume"}
                                defaultValue={[0.4, 0.6]}
                                max={1}
                                step={0.01}
                                onChange={(_, value) =>
                                    setThreshold(value as number[])
                                }
                                valueLabelDisplay="auto"
                            />
                            <Slider
                                aria-label="Volume"
                                defaultValue={0}
                                max={parsedData?.length - 1}
                                step={1}
                                onChange={(_, value) =>
                                    setFileIndex(value as number)
                                }
                                valueLabelDisplay="auto"
                            />
                        </Stack>
                    </>
                ) : (
                    <></>
                )}
            </Stack>
        </>
    )
}

export default App