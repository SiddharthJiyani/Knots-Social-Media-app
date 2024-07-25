"use client";
import React from 'react';
import Image from 'next/image';
import styles from './IconWithTooltip.module.css';
import Link from 'next/link';

interface IconWithTooltipProps {
  src: string;
  alt: string;
  tooltipText: string;
  link?: string;
  style?: string;
  onClick?: () => void;
}

const IconWithTooltip: React.FC<IconWithTooltipProps> = ({ src, alt, tooltipText, link,style,onClick }) => {
  const iconElement = (
    <div className={styles.iconWrapper} >
      <Image src={src} alt={alt} width={24} height={24} className={`${style}`} />
      <span className={styles.tooltip}>{tooltipText}</span>
    </div>
  );

  return link ? <Link href={link}>{iconElement}</Link> : iconElement;
};

export default IconWithTooltip;
