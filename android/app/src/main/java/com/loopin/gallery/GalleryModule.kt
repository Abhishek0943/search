package com.loopin.gallery

import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import com.facebook.react.bridge.*

class GalleryModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "GalleryModule"

    @ReactMethod
    fun getMedia(promise: Promise) {
        try {
            val resolver = reactContext.contentResolver
            val projection = arrayOf(
                MediaStore.Files.FileColumns._ID,
                MediaStore.Files.FileColumns.MEDIA_TYPE,
                MediaStore.MediaColumns.MIME_TYPE,
                MediaStore.MediaColumns.DATE_ADDED,
                MediaStore.MediaColumns.DURATION,
                "bucket_id",
                "bucket_display_name"
            )

            val selection = (MediaStore.Files.FileColumns.MEDIA_TYPE + "=" +
                    MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE + " OR " +
                    MediaStore.Files.FileColumns.MEDIA_TYPE + "=" +
                    MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO)

            val uri = MediaStore.Files.getContentUri("external")

            val sortOrder = MediaStore.MediaColumns.DATE_ADDED + " DESC"

            val list = Arguments.createArray()
            resolver.query(uri, projection, selection, null, sortOrder)?.use { c ->
                fun col(name: String): Int = c.getColumnIndex(name) // -1 if missing

                val idIdx = col(MediaStore.Files.FileColumns._ID)
                val typeIdx = col(MediaStore.Files.FileColumns.MEDIA_TYPE)
                val mimeIdx = col(MediaStore.MediaColumns.MIME_TYPE)
                val dateIdx = col(MediaStore.MediaColumns.DATE_ADDED)
                val durIdx  = col(MediaStore.Video.VideoColumns.DURATION)

                // bucket fallbacks
                val bucketIdIdx   = if (col("bucket_id") != -1) col("bucket_id") else col("bucketId")
                val bucketNameIdx = if (col("bucket_display_name") != -1) col("bucket_display_name") else col("bucketDisplayName")

                while (c.moveToNext()) {
                    val id = c.getLong(idIdx)
                    val mediaType = c.getInt(typeIdx)
                    val mime = c.getString(mimeIdx)
                    val createdAtSec = if (dateIdx != -1 && !c.isNull(dateIdx)) c.getLong(dateIdx) else 0L
                    val durationMs = if (durIdx != -1 && !c.isNull(durIdx)) c.getLong(durIdx) else 0L

                    val bucketId = if (bucketIdIdx != -1 && !c.isNull(bucketIdIdx)) c.getString(bucketIdIdx) else "unknown"
                    val bucketName = if (bucketNameIdx != -1 && !c.isNull(bucketNameIdx)) c.getString(bucketNameIdx) else "Unknown"

                    val contentUri = when (mediaType) {
                        MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE ->
                            ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
                        MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO ->
                            ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id)
                        else -> null
                    } ?: continue

                    val map = Arguments.createMap()
                    map.putString("uri", contentUri.toString())
                    map.putString("mime", mime)
                    map.putString("type",
                        if (mediaType == MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO) "video" else "image"
                    )
                    map.putDouble("durationSec", durationMs / 1000.0)
                    map.putString("albumId", bucketId)
                    map.putString("albumName", bucketName)
                    map.putDouble("createdAt", createdAtSec.toDouble()) // epoch seconds
                    list.pushMap(map)
                }
            }
            promise.resolve(list)
        } catch (e: Exception) {
            promise.reject("GALLERY_ERROR", e)
        }
    }
}