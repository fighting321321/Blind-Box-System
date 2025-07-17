import React, { useState, useEffect } from 'react'
import { generateBlindBoxImage } from '../utils/imageGenerator'

/**
 * 盲盒图片组件
 * 显示生成的纯色图片，支持懒加载和错误处理
 */
function BlindBoxImage({ 
  blindBoxId, 
  name, 
  width = 300, 
  height = 300, 
  className = '',
  showName = false,
  onClick = null
}) {
  const [imageSrc, setImageSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      setIsLoading(true)
      setError(false)
      
      // 生成图片
      const imageUrl = generateBlindBoxImage(blindBoxId, showName ? name : '', width, height)
      setImageSrc(imageUrl)
      setIsLoading(false)
    } catch (err) {
      console.error('生成盲盒图片失败:', err)
      setError(true)
      setIsLoading(false)
    }
  }, [blindBoxId, name, width, height, showName])

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className={`bg-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-500 text-sm text-center">
          <div className="text-2xl mb-2">📦</div>
          <div>图片加载失败</div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={name || `盲盒 ${blindBoxId}`}
      className={`object-cover ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      style={{ width, height }}
      onClick={onClick}
      onError={() => setError(true)}
    />
  )
}

export default BlindBoxImage
