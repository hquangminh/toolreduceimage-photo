import React, { useRef, useState } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './UploadComponentVideo.css'

const UploadComponentVideo = () => {
  // Giữ state cho videos tương tự như images
  const [videosPreview, setVideosPreview] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const videoInputRef = useRef(null)

  // Xử lý upload video
  const ffmpeg = createFFmpeg({ log: true })

  const handleVideoUpload = async (event) => {
    setIsLoading(true)
    const files = Array.from(event.target.files)

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    const processedVideos = await Promise.all(
      files
        .map(async (file) => {
          try {
            const { name } = file
            const outputFileName = name.replace(/\..+$/, '.mp4')

            ffmpeg.FS('writeFile', name, await fetchFile(file))

            await ffmpeg.run('-i', name, '-b:v', '1M', '-vf', 'scale=1280:720', outputFileName)

            const compressedFile = ffmpeg.FS('readFile', outputFileName)

            const videoBlob = new Blob([compressedFile.buffer], { type: 'video/mp4' })
            const previewURL = URL.createObjectURL(videoBlob)

            return {
              originalName: name,
              compressedFile: videoBlob,
              preview: previewURL,
            }
          } catch (error) {
            console.error('Error processing video:', error)
            return null
          }
        })
        .filter((video) => video !== null)
    ) // Loại bỏ bất kỳ kết quả nào là null do lỗi

    setVideosPreview((prev) => [...prev, ...processedVideos])
    setIsLoading(false)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  // Hàm xóa ảnh/video
  const handleRemove = (index, type) => {
    setVideosPreview(videosPreview.filter((_, i) => i !== index))
  }

  // Hàm reset danh sách ảnh và video
  const handleReset = () => {
    setVideosPreview([])
  }

  const handleDownloadZip = async () => {
    const zip = new JSZip()

    // Thêm video vào zip
    videosPreview.forEach(({ originalName, compressedFile }) => {
      zip.file(originalName, compressedFile)
    })

    // Tạo file .zip và tải xuống
    setIsLoading(true) // Hiển thị trạng thái đang xử lý
    zip
      .generateAsync({ type: 'blob' })
      .then(function (content) {
        saveAs(content, 'media.zip') // Tên file .zip khi tải xuống
        setIsLoading(false) // Ẩn trạng thái đang xử lý
      })
      .catch(function (err) {
        console.error('Error during ZIP generation', err)
        setIsLoading(false) // Trong trường hợp lỗi, cũng ẩn trạng thái đang xử lý
      })
  }

  return (
    <div className='upload-component'>
      <input
        id='videoInput'
        type='file'
        accept='video/*'
        multiple
        onChange={handleVideoUpload}
        disabled={isLoading}
        ref={videoInputRef}
        style={{ display: 'none' }}
      />
      <label htmlFor='videoInput' className='upload-button'>
        Upload Videos
      </label>

      {isLoading && (
        <div className='loading-overlay'>
          <div className='loader'></div>
        </div>
      )}

      <div className='videos-container'>
        {videosPreview.map((video, index) => (
          <div key={index} className='video-preview'>
            <video controls width='250'>
              <source src={video.preview} type='video/mp4' />
              Trình duyệt của bạn không hỗ trợ tag video.
            </video>
            <button onClick={() => handleRemove(index, 'video')}>Xóa</button>
          </div>
        ))}
      </div>
      {videosPreview.length > 0 && (
        <div className='button_group'>
          <button className='btn_download' onClick={handleDownloadZip}>
            Download Images as Zip
          </button>
          <button className='btn_reset' onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadComponentVideo
