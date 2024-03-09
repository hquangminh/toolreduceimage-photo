import React, { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './UploadComponent.css' // Giả sử bạn lưu CSS vào file này

const UploadComponent = () => {
  const [imagesPreview, setImagesPreview] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef(null)

  const handleImageUpload = async (event) => {
    setIsLoading(true)
    const files = Array.from(event.target.files)
    const compressedFiles = await Promise.all(
      // Tính toán maxSizeMB dựa trên dung lượng tối ưu là 70-200KB
      // Vì 1MB = 1024KB, chọn một giá trị trong khoảng này để làm maxSizeMB
      // Ví dụ, chọn 0.2 để dung lượng tối đa là khoảng 200KB

      files.map(async (file) => {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.2, // cho phép kích thước tối đa của ảnh sau khi nén là 1 MB (tức 1024 KB)
          maxWidthOrHeight: 1920, // Giữ nguyên chiều rộng/cao tối đa này nếu phù hợp
          useWebWorker: true,
        })
        return {
          originalName: file.name,
          compressedFile,
          preview: URL.createObjectURL(compressedFile),
        }
      })
    )

    setImagesPreview((prev) => [...prev, ...compressedFiles])
    setIsLoading(false)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownloadZip = async () => {
    const zip = new JSZip()
    imagesPreview.forEach(({ originalName, compressedFile }) => {
      zip.file(originalName, compressedFile)
    })
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'images.zip')
  }

  const handleRemoveImage = (index) => {
    setImagesPreview(imagesPreview.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setImagesPreview([])
  }

  return (
    <div className='upload-component'>
      <label for='fileInput' class='upload-button'>
        Upload
      </label>
      <input id='fileInput' ref={fileInputRef} type='file' accept='image/*' multiple onChange={handleImageUpload} disabled={isLoading} />{' '}
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>File: {imagesPreview.length}</p>
      {isLoading && (
        <div className='loading-overlay'>
          <div className='loader'></div>
        </div>
      )}
      <div className='images-container'>
        {imagesPreview.map((image, index) => (
          <div key={index} className='image-preview'>
            <img src={image.preview} alt={image.originalName} />
            <button onClick={() => handleRemoveImage(index)}>Xóa</button>
          </div>
        ))}
      </div>
      {imagesPreview.length > 0 && (
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

export default UploadComponent
