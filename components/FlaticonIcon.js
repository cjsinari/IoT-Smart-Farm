import React from 'react';

export const ICON_SIZES = {
  tab: 22,
  card: 20,
  chart: 18,
  empty: 48,
};

export const ICON_SPACING = {
  inline: 8,
  emptyBottom: 16,
};

export function FlaticonIcon({ Icon, size, color, style }) {
  return <Icon width={size} height={size} fill={color} style={style} />;
}
