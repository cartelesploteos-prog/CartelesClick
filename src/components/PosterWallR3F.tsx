import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Rotate3d,
  Sun,
  Moon,
  RotateCcw,
  Sparkles,
  Layers,
  Camera,
} from "lucide-react";
import { PosterDesignState } from "../types";

interface PosterWallR3FProps {
  design: PosterDesignState;
}

// Sub-component that handles the 3D Poster Mesh and its dynamic texture inside the Canvas
interface PosterMeshProps {
  design: PosterDesignState;
  isNightMode: boolean;
}

const PosterMesh: React.FC<PosterMeshProps> = ({ design, isNightMode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Compute aspect ratio dimensions
  const { width, height } = useMemo(() => {
    // Custom dimensions if specified
    if (design.outputFormat === "especial_personalizada" && design.customWidthCm && design.customHeightCm) {
      const ratio = design.customWidthCm / design.customHeightCm;
      if (ratio >= 1) {
        return { width: 2.4 * Math.min(ratio, 2.5), height: (2.4 * Math.min(ratio, 2.5)) / ratio };
      } else {
        return { width: 2.4 * ratio, height: 2.4 };
      }
    }

    switch (design.outputFormat) {
      case "portabanner_80x200":
        return { width: 1.1, height: 2.75 };
      case "portabanner_90x190":
        return { width: 1.25, height: 2.64 };
      case "portabanner_100x200":
        return { width: 1.35, height: 2.7 };
      // PVC Placas
      case "pvc_122x244_entera":
        return { width: 1.4, height: 2.8 };
      case "pvc_122x122_media":
        return { width: 2.0, height: 2.0 };
      case "pvc_61x244_media":
        return { width: 0.8, height: 3.2 };
      case "pvc_61x122_cuarto":
        return { width: 1.1, height: 2.2 };
      // PAI Placas
      case "pai_100x200_entera":
        return { width: 1.3, height: 2.6 };
      case "pai_100x100_media":
        return { width: 2.0, height: 2.0 };
      case "pai_50x200_media":
        return { width: 0.75, height: 3.0 };
      case "pai_50x100_cuarto":
        return { width: 1.1, height: 2.2 };
      // Lonas
      case "lona_200x100":
      case "lona_frontal_200x100":
        return { width: 2.8, height: 1.4 };
      case "lona_300x100":
        return { width: 3.3, height: 1.1 };
      case "lona_200x150":
        return { width: 2.6, height: 1.95 };
      case "lona_300x150":
        return { width: 3.0, height: 1.5 };
      case "cartel_100x70":
        return { width: 2.2, height: 1.54 };
      case "cuadrado_100x100":
      default:
        return { width: 1.9, height: 1.9 };
    }
  }, [design.outputFormat, design.customWidthCm, design.customHeightCm]);

  // Generate dynamic 2D canvas texture
  useEffect(() => {
    if (!textureCanvasRef.current) {
      textureCanvasRef.current = document.createElement("canvas");
    }
    const canvas = textureCanvasRef.current;
    const texHeight = 2048;
    const texWidth = Math.round((width / height) * texHeight);
    canvas.width = texWidth;
    canvas.height = texHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background (Solid, Gradient, or Base Color)
    if (design.backgroundMode === "gradient" && design.gradientConfig) {
      const { type, color1, color2, angle = 90 } = design.gradientConfig;
      if (type === "radial") {
        const grad = ctx.createRadialGradient(
          texWidth / 2,
          texHeight / 2,
          10,
          texWidth / 2,
          texHeight / 2,
          Math.max(texWidth, texHeight) / 1.2
        );
        grad.addColorStop(0, color1 || "#EE7828");
        grad.addColorStop(1, color2 || "#2C2C2C");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, texWidth, texHeight);
      } else {
        // Linear with angle
        const rad = (angle * Math.PI) / 180;
        const x1 = texWidth / 2 - (Math.cos(rad) * texWidth) / 2;
        const y1 = texHeight / 2 - (Math.sin(rad) * texHeight) / 2;
        const x2 = texWidth / 2 + (Math.cos(rad) * texWidth) / 2;
        const y2 = texHeight / 2 + (Math.sin(rad) * texHeight) / 2;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, color1 || "#EE7828");
        grad.addColorStop(1, color2 || "#2C2C2C");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, texWidth, texHeight);
      }
    } else {
      ctx.fillStyle = design.backgroundColor || "#2C2C2C";
      ctx.fillRect(0, 0, texWidth, texHeight);
    }

    // 1.1 Background Image (if configured)
    if (design.backgroundImageUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = design.backgroundImageUrl;
      bgImg.onload = () => {
        try {
          ctx.save();
          const op = design.backgroundImageOpacity ?? 0.45;
          ctx.globalAlpha = op;
          // Cover aspect ratio
          const scale = Math.max(texWidth / bgImg.width, texHeight / bgImg.height);
          const nw = bgImg.width * scale;
          const nh = bgImg.height * scale;
          const nx = (texWidth - nw) / 2;
          const ny = (texHeight - nh) / 2;
          ctx.drawImage(bgImg, nx, ny, nw, nh);

          // Optional darken/tint filter
          if (design.backgroundImageFilter === "darken") {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, texWidth, texHeight);
          } else if (design.backgroundImageFilter === "grayscale") {
            // Apply slight contrast
          }
          ctx.restore();
          if (newTex) newTex.needsUpdate = true;
        } catch {
          // ignore CORS
        }
      };
    }

    // 2. Texture & Pattern Overlays
    const patOpacity = design.textureOpacity ?? 0.12;
    if (design.texture === "dots") {
      ctx.fillStyle = design.textColor || "#ffffff";
      ctx.globalAlpha = patOpacity;
      const dotSpacing = 36;
      for (let x = 0; x < texWidth; x += dotSpacing) {
        for (let y = 0; y < texHeight; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
    } else if (design.texture === "grid") {
      ctx.strokeStyle = design.textColor || "#ffffff";
      ctx.globalAlpha = patOpacity;
      ctx.lineWidth = 2;
      const gridSpacing = 48;
      ctx.beginPath();
      for (let x = 0; x < texWidth; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, texHeight);
      }
      for (let y = 0; y < texHeight; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(texWidth, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (design.texture === "diagonal") {
      ctx.strokeStyle = design.textColor || "#ffffff";
      ctx.globalAlpha = patOpacity * 0.9;
      ctx.lineWidth = 2;
      const step = 32;
      ctx.beginPath();
      for (let i = -texHeight; i < texWidth + texHeight; i += step) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + texHeight, texHeight);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (design.texture === "crosshatch") {
      ctx.strokeStyle = design.textColor || "#ffffff";
      ctx.globalAlpha = patOpacity * 0.7;
      ctx.lineWidth = 1.5;
      const step = 40;
      ctx.beginPath();
      for (let i = -texHeight; i < texWidth + texHeight; i += step) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + texHeight, texHeight);
        ctx.moveTo(i + texHeight, 0);
        ctx.lineTo(i, texHeight);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (design.texture === "halftone") {
      ctx.fillStyle = design.textColor || "#ffffff";
      ctx.globalAlpha = patOpacity * 1.2;
      const size = 32;
      for (let x = 0; x < texWidth; x += size) {
        for (let y = 0; y < texHeight; y += size) {
          const distFromCenter = Math.sin((x / texWidth) * Math.PI) * Math.sin((y / texHeight) * Math.PI);
          const r = Math.max(1, distFromCenter * 6);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
    } else if (design.texture === "blueprint") {
      ctx.strokeStyle = design.primaryColor || "#EE7828";
      ctx.globalAlpha = patOpacity * 1.2;
      ctx.lineWidth = 1;
      const smallStep = 24;
      ctx.beginPath();
      for (let x = 0; x < texWidth; x += smallStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, texHeight);
      }
      for (let y = 0; y < texHeight; y += smallStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(texWidth, y);
      }
      ctx.stroke();
      // Major lines
      ctx.lineWidth = 2.5;
      const majorStep = smallStep * 4;
      ctx.beginPath();
      for (let x = 0; x < texWidth; x += majorStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, texHeight);
      }
      for (let y = 0; y < texHeight; y += majorStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(texWidth, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (design.texture === "stripes") {
      ctx.fillStyle = design.textColor || "#ffffff";
      ctx.globalAlpha = patOpacity * 0.7;
      const barW = 28;
      const gap = 56;
      for (let x = 0; x < texWidth; x += gap) {
        ctx.fillRect(x, 0, barW, texHeight);
      }
      ctx.globalAlpha = 1.0;
    }

    const padX = texWidth * 0.08;
    const padY = texHeight * 0.07;
    const alignX =
      design.alignment === "left"
        ? padX
        : design.alignment === "right"
        ? texWidth - padX
        : texWidth / 2;
    ctx.textAlign = design.alignment;

    // 3. Logo or Header Brand Tag
    let currentY = padY + 30;
    if (design.logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = design.logoUrl;
      img.onload = () => {
        try {
          const logoH = texHeight * 0.08;
          const logoW = (img.width / img.height) * logoH;
          const lx =
            design.alignment === "left"
              ? padX
              : design.alignment === "right"
              ? texWidth - padX - logoW
              : (texWidth - logoW) / 2;
          ctx.drawImage(img, lx, padY, logoW, logoH);
          if (newTex) newTex.needsUpdate = true;
        } catch {
          // ignore CORS
        }
      };
      currentY += texHeight * 0.09;
    } else {
      ctx.fillStyle = design.accentColor || "#C5BAAA";
      ctx.font = "500 32px monospace";
      ctx.fillText("★ CARTELES.CLICK ★", alignX, currentY);
      currentY += 60;
    }

    // 4. Headline (Libre Franklin)
    currentY += 50;
    const wrapText = (
      text: string,
      maxWidth: number,
      lineHeight: number,
      fillStyle: string,
      fontStr: string
    ) => {
      ctx.fillStyle = fillStyle;
      ctx.font = fontStr;
      const words = text.split(" ");
      let line = "";
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), alignX, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), alignX, currentY);
      currentY += lineHeight;
    };

    wrapText(
      design.headline.toUpperCase(),
      texWidth - padX * 2,
      Math.round(texWidth * 0.085),
      design.primaryColor || "#EE7828",
      `500 ${Math.round(texWidth * 0.075)}px 'Libre Franklin', sans-serif`
    );

    // 5. Subheadline (DM Sans)
    currentY += 20;
    wrapText(
      design.subheadline,
      texWidth - padX * 2,
      Math.round(texWidth * 0.05),
      design.accentColor || "#C5BAAA",
      `500 ${Math.round(texWidth * 0.04)}px 'DM Sans', sans-serif`
    );

    // 6. Body text (DM Sans 400)
    currentY += 40;
    ctx.globalAlpha = 0.85;
    wrapText(
      design.bodyText,
      texWidth - padX * 2,
      Math.round(texWidth * 0.046),
      design.textColor || "#ffffff",
      `400 ${Math.round(texWidth * 0.034)}px 'DM Sans', sans-serif`
    );
    ctx.globalAlpha = 1.0;

    // 7. Footer Contact Divider & Details
    const footerY = texHeight - padY - 110;
    ctx.strokeStyle = `${design.textColor || "#ffffff"}33`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, footerY);
    ctx.lineTo(texWidth - padX, footerY);
    ctx.stroke();

    ctx.fillStyle = design.textColor || "#ffffff";
    ctx.font = `500 ${Math.round(texWidth * 0.032)}px 'DM Sans', sans-serif`;
    ctx.textAlign = "center";
    if (design.contactAddress) {
      ctx.fillText(design.contactAddress, texWidth / 2, footerY + 45);
    }
    const contactLine = [
      design.contactWhatsapp ? `WhatsApp: ${design.contactWhatsapp}` : null,
      design.contactInstagram ? `IG: ${design.contactInstagram}` : null,
      design.contactPhone ? `Tel: ${design.contactPhone}` : null,
    ]
      .filter(Boolean)
      .join("  |  ");
    if (contactLine) {
      ctx.fillText(contactLine, texWidth / 2, footerY + 90);
    }

    // 8. Foreground Elements (Stickers, Badges, Overlays)
    if (design.foregroundElements && design.foregroundElements.length > 0) {
      design.foregroundElements.forEach((elem) => {
        const posX = (elem.x / 100) * texWidth;
        const posY = (elem.y / 100) * texHeight;
        const elemScale = elem.scale || 1.0;
        const rotRad = ((elem.rotation || 0) * Math.PI) / 180;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(rotRad);
        ctx.scale(elemScale, elemScale);

        if (elem.type === "image" && elem.url) {
          const fImg = new Image();
          fImg.crossOrigin = "anonymous";
          fImg.src = elem.url;
          fImg.onload = () => {
            try {
              const baseW = texWidth * 0.22;
              const baseH = (fImg.height / fImg.width) * baseW;
              ctx.save();
              ctx.translate(posX, posY);
              ctx.rotate(rotRad);
              ctx.scale(elemScale, elemScale);
              ctx.drawImage(fImg, -baseW / 2, -baseH / 2, baseW, baseH);
              ctx.restore();
              if (newTex) newTex.needsUpdate = true;
            } catch {
              // ignore
            }
          };
        } else {
          // Render Badge / Sticker
          const label = elem.text || elem.title || "★ PROMO ★";
          ctx.font = "900 36px 'Libre Franklin', sans-serif";
          const metrics = ctx.measureText(label);
          const paddingX = 36;
          const badgeW = metrics.width + paddingX * 2;
          const badgeH = 68;
          const radius = 18;

          // Shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 16;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 6;

          // Background Fill
          let bgCol = "#EE7828";
          let textCol = "#FFFFFF";
          let borderCol = "#FFFFFF";

          if (elem.badgeStyle === "graphite" || elem.badgeStyle === "dark") {
            bgCol = "#2C2C2C";
            textCol = "#FAF8F5";
            borderCol = "#EE7828";
          } else if (elem.badgeStyle === "concrete" || elem.badgeStyle === "light") {
            bgCol = "#C5BAAA";
            textCol = "#2C2C2C";
            borderCol = "#2C2C2C";
          } else if (elem.badgeStyle === "craft") {
            bgCol = "#806D61";
            textCol = "#FAF8F5";
            borderCol = "#C5BAAA";
          }

          ctx.fillStyle = bgCol;
          ctx.beginPath();
          ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, radius);
          ctx.fill();

          // Border
          ctx.shadowColor = "transparent";
          ctx.lineWidth = 4;
          ctx.strokeStyle = borderCol;
          ctx.stroke();

          // Inner dash line for sticker look
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = `${textCol}66`;
          ctx.beginPath();
          ctx.roundRect(-badgeW / 2 + 5, -badgeH / 2 + 5, badgeW - 10, badgeH - 10, radius - 4);
          ctx.stroke();
          ctx.setLineDash([]);

          // Text
          ctx.fillStyle = textCol;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, 0, 2);
        }

        ctx.restore();
      });
    }

    const newTex = new THREE.CanvasTexture(canvas);
    newTex.colorSpace = THREE.SRGBColorSpace;
    newTex.minFilter = THREE.LinearFilter;
    newTex.magFilter = THREE.LinearFilter;
    setTexture(newTex);

    return () => {
      newTex.dispose();
    };
  }, [design, width, height]);

  // Frame parameters
  const frameThickness = 0.03;
  const frameDepth = 0.04;

  return (
    <group position={[0, 0, 0]}>
      {/* The Poster Sheet */}
      <mesh ref={meshRef} position={[0, 0, 0.01]} castShadow receiveShadow>
        <planeGeometry args={[width, height, 16, 16]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.4}
            metalness={0.05}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial color={design.backgroundColor || "#090d16"} />
        )}
      </mesh>

      {/* Minimalist Slim Aluminum Frame Bars */}
      {/* Top Bar */}
      <mesh position={[0, height / 2 + frameThickness / 2, 0.01]} castShadow>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#1e222d" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Bottom Bar */}
      <mesh position={[0, -height / 2 - frameThickness / 2, 0.01]} castShadow>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#1e222d" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left Bar */}
      <mesh position={[-width / 2 - frameThickness / 2, 0, 0.01]} castShadow>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#1e222d" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right Bar */}
      <mesh position={[width / 2 + frameThickness / 2, 0, 0.01]} castShadow>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#1e222d" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Wall Plane behind the poster */}
      <mesh position={[0, 0, -0.02]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial
          color={isNightMode ? "#0d1017" : "#1a1d26"}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      {/* Concrete/Studio Floor */}
      <mesh
        position={[0, -height / 2 - 0.5, 3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial
          color={isNightMode ? "#090a0f" : "#12141c"}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Wall Baseboard (Zócalo) */}
      <mesh position={[0, -height / 2 - 0.46, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.08, 0.06]} />
        <meshStandardMaterial color="#2a2e3d" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Interactive camera controller inside Fiber Canvas
interface SceneRigProps {
  isAutoRotate: boolean;
  userRotation: { x: number; y: number; zoom: number };
}

const SceneRig: React.FC<SceneRigProps> = ({ isAutoRotate, userRotation }) => {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (isAutoRotate) {
      state.camera.position.x = Math.sin(t * 0.4) * 0.7 + userRotation.x;
      state.camera.position.y = Math.sin(t * 0.3) * 0.15 + userRotation.y;
      state.camera.position.z = 4.2 / userRotation.zoom;
      state.camera.lookAt(0, 0, 0);
    } else {
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        userRotation.x * 3,
        0.1
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        userRotation.y * 2,
        0.1
      );
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        4.2 / userRotation.zoom,
        0.1
      );
      state.camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

export const PosterWallR3F: React.FC<PosterWallR3FProps> = ({ design }) => {
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [userRotation, setUserRotation] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - prevMouseRef.current.x) * 0.004;
    const dy = (e.clientY - prevMouseRef.current.y) * 0.004;
    setUserRotation((prev) => ({
      ...prev,
      x: Math.max(-1.5, Math.min(1.5, prev.x - dx)),
      y: Math.max(-0.8, Math.min(0.8, prev.y + dy)),
    }));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    setUserRotation((prev) => ({
      ...prev,
      zoom: Math.max(0.7, Math.min(1.8, prev.zoom + zoomDelta)),
    }));
  };

  const handleReset = () => {
    setUserRotation({ x: 0, y: 0, zoom: 1 });
    setIsAutoRotate(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] sm:h-[540px] rounded-[7px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Canvas R3F */}
      <div className="w-full h-full">
        <Canvas
          shadows
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: isNightMode ? 1.0 : 1.15,
          }}
        >
          {/* Lighting Rig */}
          <ambientLight intensity={isNightMode ? 0.35 : 0.8} />
          <directionalLight
            position={[3, 4, 3]}
            intensity={isNightMode ? 0.4 : 1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Brick / Concrete Accent Spotlight */}
          <spotLight
            position={[0, 2.5, 2.2]}
            intensity={isNightMode ? 2.8 : 1.2}
            color={isNightMode ? "#EE7828" : "#ffffff"}
            angle={Math.PI / 3.5}
            penumbra={0.5}
            castShadow
          />

          {/* Interactive Rig */}
          <SceneRig
            isAutoRotate={isAutoRotate}
            userRotation={userRotation}
          />

          {/* 3D Poster on Wall */}
          <PosterMesh design={design} isNightMode={isNightMode} />
        </Canvas>
      </div>

      {/* FLOATING TOP CONTROLS (Minimalist Two-Color Purple/Lime Bar with 7px Radius) */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-1.5 p-1 rounded-[7px] bg-[var(--bg-surface)]/90 backdrop-blur border border-[var(--border-subtle)] pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-primary)]">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-heading font-medium text-[11px]">
              Pared de Galería 3D
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-2 rounded-[7px] border backdrop-blur transition-colors text-xs flex items-center gap-1 min-h-[2.25rem] ${
              isNightMode
                ? "bg-accent text-black border-accent font-medium"
                : "bg-[var(--bg-surface)]/90 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            title={isNightMode ? "Modo Día" : "Modo Noche con Focos"}
          >
            {isNightMode ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-2 rounded-[7px] border backdrop-blur transition-colors text-xs flex items-center gap-1 min-h-[2.25rem] ${
              isAutoRotate
                ? "bg-primary text-white border-primary"
                : "bg-[var(--bg-surface)]/90 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            title={isAutoRotate ? "Pausar Rotación" : "Activar Giro 3D"}
          >
            <Rotate3d className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[2.25rem]"
            title="Centrar Cámara"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FLOATING BOTTOM BAR HINT */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10 text-[11px] text-[var(--text-secondary)]">
        <div className="px-2.5 py-1 rounded-[7px] bg-[var(--bg-surface)]/90 border border-[var(--border-subtle)] backdrop-blur flex items-center gap-1.5 pointer-events-auto">
          <Rotate3d className="w-3 h-3 text-primary" />
          <span className="font-sans">Arrastrá para orbitar · Rueda para zoom</span>
        </div>
        <div className="px-2.5 py-1 rounded-[7px] bg-[var(--bg-surface)]/90 border border-[var(--border-subtle)] backdrop-blur font-mono-num pointer-events-auto text-[10px] text-[var(--text-muted)]">
          Three.js · R3F Realtime
        </div>
      </div>
    </div>
  );
};
