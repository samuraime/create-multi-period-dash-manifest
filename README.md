# Make multi period DASH manifest

## Requirements

Install [ffmpeg](http://ffmpeg.org) and [bento4](http://www.bento4.com).

```sh
brew install ffmpeg
brew install bento4
npm install
```

## Try it!

```sh
npm run make
npm run start
```

### Steps

- Convert media codecs for online streaming, e.g. with H264 video and AAC audio (optional)

    ```sh
    ffmpeg -i input.mp4 -vf "scale=1280:720" -c:v h264 -c:a aac output.mp4
    ```

- Fragment

    ```sh
    mp4fragment videos/h264_aac/bbb.mp4 videos/fragmented/bbb.mp4
    ```

- Create single period DASH manifest

    ```sh
    mp4dash -f \
        --profiles=urn:mpeg:dash:profile:isoff-main:2011 \
        --use-segment-timeline \
        --min-buffer-time=8 \
        -o output/bbb \
        videos/fragmented/bbb.mp4
    ```

- Concat DASH manifests

    - `MPD.mediaPresentationDuration`
    - `Period.start`
    - `Representation.id`

    ```sh
    npm run make
    ```
