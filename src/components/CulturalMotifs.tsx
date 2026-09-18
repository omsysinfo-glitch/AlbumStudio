import React from 'react';
import { CulturalColorPalette, FrameBorderStyle } from '../types';

interface CornerMotifProps {
  type: FrameBorderStyle['cornerMotif'];
  color: string;
  accentColor: string;
  size?: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * High-precision vector ornamental motifs for cultural Indian Wedding albums
 */
export const CornerMotif: React.FC<CornerMotifProps> = ({
  type,
  color,
  accentColor,
  size = 36,
  position,
}) => {
  // Rotate SVG according to corner position
  const getTransform = () => {
    switch (position) {
      case 'top-left':
        return '';
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
    }
  };

  const style: React.CSSProperties = {
    transform: getTransform(),
    transformOrigin: 'center',
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 15,
    ...(position === 'top-left' && { top: -2, left: -2 }),
    ...(position === 'top-right' && { top: -2, right: -2 }),
    ...(position === 'bottom-left' && { bottom: -2, left: -2 }),
    ...(position === 'bottom-right' && { bottom: -2, right: -2 }),
  };

  if (type === 'jaali_lattice') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={style}
        className="drop-shadow-xs"
      >
        {/* Outer Corner Bracket */}
        <path
          d="M 2 46 L 2 2 L 46 2"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="square"
        />
        <path
          d="M 6 40 L 6 6 L 40 6"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeLinecap="square"
        />

        {/* Mughal 8-pointed geometric jaali star corner fragment */}
        <path
          d="M 10 10 L 22 10 L 26 14 L 26 26 L 14 26 L 10 22 Z"
          fill={accentColor}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="1"
        />
        <circle cx="18" cy="18" r="3.5" fill={color} />
        <circle cx="18" cy="18" r="1.5" fill={accentColor} />

        {/* Intricate Geometric Interlacing Bars */}
        <line x1="2" y1="18" x2="10" y2="18" stroke={color} strokeWidth="1.5" />
        <line x1="18" y1="2" x2="18" y2="10" stroke={color} strokeWidth="1.5" />
        <line x1="26" y1="14" x2="34" y2="6" stroke={color} strokeWidth="1.2" />
        <line x1="14" y1="26" x2="6" y2="34" stroke={color} strokeWidth="1.2" />

        {/* Finial Diamonds */}
        <rect
          x="38"
          y="1"
          width="4"
          height="4"
          transform="rotate(45 40 3)"
          fill={color}
        />
        <rect
          x="1"
          y="38"
          width="4"
          height="4"
          transform="rotate(45 3 40)"
          fill={color}
        />
      </svg>
    );
  }

  if (type === 'mandala_flourish') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={style}
        className="drop-shadow-xs"
      >
        <path
          d="M 3 45 L 3 3 L 45 3"
          stroke={color}
          strokeWidth="2"
        />
        {/* Quarter Radial Mandala Burst */}
        <path
          d="M 3 24 C 14 24 24 14 24 3"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 3 32 C 19 32 32 19 32 3"
          stroke={accentColor}
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Petals */}
        <path
          d="M 3 3 Q 12 12 3 20 Q 12 12 20 3 Z"
          fill={accentColor}
          fillOpacity="0.25"
          stroke={color}
          strokeWidth="1.2"
        />
        <circle cx="8" cy="8" r="2.5" fill={color} />
        <circle cx="16" cy="16" r="2" fill={accentColor} />
      </svg>
    );
  }

  if (type === 'mandap_arch') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={style}
      >
        <path
          d="M 2 44 L 2 2 L 44 2"
          stroke={color}
          strokeWidth="2.5"
        />
        {/* Scalloped Cusp Arch */}
        <path
          d="M 2 30 C 10 30 14 26 18 20 C 22 14 26 10 30 2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <circle cx="12" cy="12" r="3" fill={accentColor} />
        <circle cx="12" cy="12" r="1.5" fill={color} />
      </svg>
    );
  }

  if (type === 'ornate_bracket') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={style}
      >
        <path
          d="M 2 36 L 2 2 L 36 2"
          stroke={color}
          strokeWidth="3"
        />
        <path
          d="M 7 28 L 7 7 L 28 7"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <rect x="12" y="12" width="6" height="6" fill={color} />
      </svg>
    );
  }

  // Minimal Gold Accent Bracket
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
    >
      <path
        d="M 2 24 L 2 2 L 24 2"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="5" cy="5" r="2" fill={accentColor} />
    </svg>
  );
};

interface CenterGutterMedallionProps {
  palette: CulturalColorPalette;
  position: 'top' | 'bottom';
}

/**
 * Ornate Kalash / Lotus Medallion placed subtly at the spread gutter fold
 */
export const CenterGutterMedallion: React.FC<CenterGutterMedallionProps> = ({
  palette,
  position,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        [position]: 6,
        zIndex: 20,
        pointerEvents: 'none',
      }}
      className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
    >
      <svg width="40" height="20" viewBox="0 0 60 30" fill="none">
        {/* Symmetrical ornamental filigree lotus crest */}
        <path
          d="M 30 2 C 22 10 10 18 0 18 C 12 20 24 24 30 29 C 36 24 48 20 60 18 C 50 18 38 10 30 2 Z"
          fill={palette.secondary}
          fillOpacity="0.2"
          stroke={palette.borderStroke}
          strokeWidth="1.5"
        />
        <circle cx="30" cy="16" r="3" fill={palette.primary} stroke={palette.secondary} strokeWidth="1" />
        <circle cx="20" cy="18" r="1.5" fill={palette.secondary} />
        <circle cx="40" cy="18" r="1.5" fill={palette.secondary} />
      </svg>
    </div>
  );
};

interface SpreadCulturalWatermarkProps {
  palette: CulturalColorPalette;
  borderStyle: FrameBorderStyle;
}

/**
 * Subtle traditional Mughal Jaali lattice background texture for the entire spread
 */
export const SpreadCulturalWatermark: React.FC<SpreadCulturalWatermarkProps> = ({
  palette,
  borderStyle,
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Repeating Jaali Pattern SVG */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.045 }}
      >
        <defs>
          <pattern
            id="mughal-jaali-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Eight-Pointed Star Lattice Grid */}
            <path
              d="M 30 0 L 40 10 L 40 20 L 50 30 L 40 40 L 40 50 L 30 60 L 20 50 L 20 40 L 10 30 L 20 20 L 20 10 Z"
              fill="none"
              stroke={palette.primary}
              strokeWidth="1.2"
            />
            <circle cx="30" cy="30" r="4" fill="none" stroke={palette.secondary} strokeWidth="1" />
            <line x1="0" y1="30" x2="60" y2="30" stroke={palette.secondary} strokeWidth="0.8" strokeDasharray="2 4" />
            <line x1="30" y1="0" x2="30" y2="60" stroke={palette.secondary} strokeWidth="0.8" strokeDasharray="2 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mughal-jaali-pattern)" />
      </svg>

      {/* Subtle Gold Dust Radial Ambient Glow on Spine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '46%',
          right: '46%',
          background: `radial-gradient(ellipse at center, ${palette.secondary}15 0%, transparent 80%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
