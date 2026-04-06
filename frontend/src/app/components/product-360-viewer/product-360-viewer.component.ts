import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-360-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewer-container" #viewerContainer>
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <div class="loading-text">Loading 360° View ({{loadingProgress}}%)</div>
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
export class Product360ViewerComponent implements OnInit, AfterViewInit {
  @Input() images: string[] = [];
  
  currentFrame = 0;
  isLoading = true;
  loadingProgress = 0;
  
  private isDragging = false;
  private startX = 0;
  private frameAtDragStart = 0;
  
  // Sensitivity: pixels needed to drag to move one frame
  // Smaller number = faster rotation
  private sensitivity = 10;
  
  private animationFrameId: number | null = null;
  private loadedImageElements: HTMLImageElement[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.images && this.images.length > 0) {
      this.preloadImages();
    } else {
      this.isLoading = false;
    }
  }

  private preloadImages(): void {
    let loadedCount = 0;
    this.isLoading = true;
    this.loadingProgress = 0;
    
    const totalImages = this.images.length;

    this.images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        this.loadingProgress = Math.round((loadedCount / totalImages) * 100);
        if (loadedCount === totalImages) {
          this.isLoading = false;
        }
      };
      img.onerror = () => {
        console.error(`Failed to load frame ${index} for 360 viewer`);
        loadedCount++;
        this.loadingProgress = Math.round((loadedCount / totalImages) * 100);
        if (loadedCount === totalImages) {
          this.isLoading = false;
        }
      };
      img.src = src;
      this.loadedImageElements.push(img);
    });
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
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      // Prevent scrolling while rotating
      event.preventDefault();
      this.handleDrag(event.touches[0].clientX);
    }
  }

  onTouchEnd(): void {
    this.endDrag();
  }

  private startDrag(startX: number): void {
    this.isDragging = true;
    this.startX = startX;
    this.frameAtDragStart = this.currentFrame;
  }

  private handleDrag(currentX: number): void {
    if (!this.isDragging || this.images.length === 0) return;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const deltaX = currentX - this.startX;
      // Calculate how many frames to move based on deltaX and sensitivity
      // Moving right (positive delta) -> previous frame (rotate left)
      // Moving left (negative delta) -> next frame (rotate right)
      const framesToMove = Math.floor(deltaX / this.sensitivity);
      
      let newFrame = this.frameAtDragStart - framesToMove;
      
      // Ensure positive modulo logic for wrap-around
      const totalFrames = this.images.length;
      newFrame = ((newFrame % totalFrames) + totalFrames) % totalFrames;
      
      this.currentFrame = newFrame;
    });
  }

  private endDrag(): void {
    this.isDragging = false;
  }
}
