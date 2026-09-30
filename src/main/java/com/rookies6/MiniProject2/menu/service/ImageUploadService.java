package com.rookies6.MiniProject2.menu.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String uploadMenuImage(MultipartFile image) {
        if (image.isEmpty() || image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new BusinessException(ErrorCode.INVALID_IMAGE_FILE);
        }

        try {
            Path dirPath = Paths.get(uploadDir);
            Files.createDirectories(dirPath);

            String originalName = image.getOriginalFilename();
            String extension = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            String savedFileName = UUID.randomUUID() + extension;

            Path targetPath = dirPath.resolve(savedFileName);
            image.transferTo(targetPath);

            return "/images/" + savedFileName;
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.IMAGE_UPLOAD_FAILED, e.getMessage());
        }
    }
}