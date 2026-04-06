import { Component, Input, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-360-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewer-container">
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <div class="loading-text">Loading 360° View...</div>
      </div>
      
      <div class="viewer-content" 
           [class.hidden]="isLoading"
           (mousedown)="onMouseDown($event)"
           (mousemove)="onMouseMove($event)"
           (mouseup)="onMouseUp()"
           (mouseleave)="onMouseUp()"
           (touchstart)="onTouchStart($event)"
           (touchmove)="onTouchMove($event)"
           (touchend)="onTouchEnd()">
        
        <img *ngIf="images.length > 0" 
             [src]="images[currentFrame]" 
             alt="360 degree product view" 
             class="viewer-image"
             draggable="false" />
        
        <div class="viewer-hint">
          <i class="fa-solid fa-arrows-left-right"></i> 360° View – Drag to rotate
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 400px;
      aspect-ratio: 1;
      background: #1A1A1A;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #333;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(26, 26, 26, 0.9);
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(212, 175, 55, 0.3);
      border-radius: 50%;
      border-top-color: #D4AF37;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: #D4AF37;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .viewer-content {
      width: 100%;
      height: 100%;
      position: relative;
      cursor: grab;
    }
    
    .viewer-content:active {
      cursor: grabbing;
    }

    .viewer-content.hidden {
      opacity: 0;
    }

    .viewer-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none; /* Prevent native dragging */
      /* use hardware accel for swapping if possible */
      transform: translateZ(0); 
    }

    .viewer-hint {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      opacity: 0.8;
      transition: opacity 0.3s;
    }

    .viewer-content:hover .viewer-hint {
      opacity: 1;
    }
    
    .viewer-hint i {
      color: #D4AF37;
    }
  `]
})
export class Product360ViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() images: string[] = [];
  
  currentFrame = 0;
  isLoading = true;
  
  private isDragging = false;
  private startX = 0;
  private targetFrame = 0;
  private currentFloatFrame = 0;
  private isAnimating = false;
  
  private touchStartY = 0;
  private isTouchScrollIntent: boolean | null = null;
  private sensitivity = 5; 
  private animationFrameId: number | null = null;
  
  private cachedFrames = new Map<number, HTMLImageElement>();
  private CACHE_RANGE = 3;
  
  private isLowPerformance = false;
  private prefersReducedMotion = false;
  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  constructor() { }

  ngOnInit(): void {
    const nav = navigator as any;
    if ((nav.deviceMemory && nav.deviceMemory <= 4) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4)) {
       this.isLowPerformance = true;
    }

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = mql.matches;
    this.mediaQueryListener = (e) => this.prefersReducedMotion = e.matches;
    mql.addEventListener('change', this.mediaQueryListener);
  }

  ngAfterViewInit(): void {
    if (this.images && this.images.length > 0) {
      this.loadInitialFrames();
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.mediaQueryListener) {
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', this.mediaQueryListener);
    }
    this.flushCache();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.hidden) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    } else if (this.isAnimating) {
      this.startAnimationLoop();
    }
  }

  private loadInitialFrames(): void {
    this.isLoading = true;
    
    // Load just the first frame to display something immediately
    const firstImg = new Image();
    firstImg.onload = () => {
      firstImg.decode().then(() => {
        this.isLoading = false;
        this.cachedFrames.set(0, firstImg);
        this.manageCache(0); // preloads nearby +- 3 frames for initial interaction
      }).catch(() => {
        this.isLoading = false;
      });
    };
    firstImg.onerror = () => {
      this.isLoading = false; 
    };
    firstImg.src = this.images[0];
  }

  private manageCache(centerFrame: number): void {
    const totalFrames = this.images.length;
    if (totalFrames === 0) return;

    // Load nearby frames
    for (let i = -this.CACHE_RANGE; i <= this.CACHE_RANGE; i++) {
      const idx = ((centerFrame + i) % totalFrames + totalFrames) % totalFrames;
      if (!this.cachedFrames.has(idx)) {
        const img = new Image();
        img.src = this.images[idx];
        // Decode off main thread to prevent jank
        img.decode().then(() => {
           this.cachedFrames.set(idx, img);
        }).catch(() => {});
      }
    }

    // Release distant frames
    for (const key of Array.from(this.cachedFrames.keys())) {
      const dist = Math.min(Math.abs(key - centerFrame), totalFrames - Math.abs(key - centerFrame));
      if (dist > this.CACHE_RANGE) {
        const img = this.cachedFrames.get(key);
        if (img) img.src = ''; // Helps garbage collector
        this.cachedFrames.delete(key);
      }
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.startDrag(event.clientX);
  }

  onMouseMove(event: MouseEvent): void {
    this.handleDrag(event.clientX);
  }

  onMouseUp(): void {
    this.endDrag();
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.startDrag(event.touches[0].clientX);
      this.touchStartY = event.touches[0].clientY;
      this.isTouchScrollIntent = null;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      
      if (this.isTouchScrollIntent === null) {
        const deltaX = Math.abs(currentX - this.startX);
        const deltaY = Math.abs(currentY - this.touchStartY);
        
        if (deltaX > 5 || deltaY > 5) {
          if (deltaY > deltaX) {
            this.isTouchScrollIntent = true; 
            this.endDrag();
          } else {
            this.isTouchScrollIntent = false;
          }
        }
      }
      
      if (this.isTouchScrollIntent === false) {
        event.preventDefault();
        this.handleDrag(currentX);
      }
    }
  }

  onTouchEnd(): void {
    this.endDrag();
  }

  private startDrag(startX: number): void {
    this.isDragging = true;
    this.startX = startX;
    this.targetFrame = this.currentFloatFrame;
  }

  private handleDrag(currentX: number): void {
    if (!this.isDragging || this.images.length === 0) return;

    const deltaX = currentX - this.startX;
    const framesToMove = deltaX / this.sensitivity; 
    
    this.targetFrame = this.currentFloatFrame - framesToMove;
    
    this.startX = currentX;
    this.currentFloatFrame = this.targetFrame; 
    
    this.startAnimationLoop();
  }

  private startAnimationLoop(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const loop = () => {
      const skipInertia = this.isLowPerformance || this.prefersReducedMotion;
      
      if (!this.isDragging) {
        const diff = this.targetFrame - this.currentFloatFrame;
        
        if (skipInertia || Math.abs(diff) < 0.05) {
          this.currentFloatFrame = this.targetFrame;
          this.isAnimating = false;
        } else {
          this.currentFloatFrame += diff * 0.15;
          this.animationFrameId = requestAnimationFrame(loop);
        }
      } else {
        this.currentFloatFrame = this.targetFrame;
        this.animationFrameId = requestAnimationFrame(loop);
        
        if (Math.abs(this.targetFrame - this.currentFloatFrame) < 0.05) {
            this.isAnimating = false;
        }
      }

      this.updateCurrentFrame();
    };
    
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private updateCurrentFrame(): void {
    const totalFrames = this.images.length;
    if (totalFrames > 0) {
      const normalizedFrame = Math.round(this.currentFloatFrame);
      const newFrame = ((normalizedFrame % totalFrames) + totalFrames) % totalFrames;
      
      if (this.currentFrame !== newFrame) {
        this.currentFrame = newFrame;
        this.manageCache(this.currentFrame);
      }
    }
  }

  private endDrag(): void {
    this.isDragging = false;
    if (Math.abs(this.targetFrame - this.currentFloatFrame) > 0.1) {
      if (!this.isLowPerformance && !this.prefersReducedMotion) {
        this.startAnimationLoop();
      }
    }
  }

  private flushCache(): void {
    for (const key of Array.from(this.cachedFrames.keys())) {
      const img = this.cachedFrames.get(key);
      if (img) img.src = '';
    }
    this.cachedFrames.clear();
  }
}

