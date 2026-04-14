import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [RouterLink],
    template: `
    <section class="about-page">
      <div class="about-hero">
        <div class="container">
          <h1>Our <span class="gold">Story</span></h1>
          <p>Three decades of crafting timeless elegance</p>
        </div>
      </div>

      <div class="container">
        <div class="about-content">
          <div class="about-text animate-fadeInUp">
            <h2>Crafting Elegance Since 1995</h2>
            <p>Kairo Jewellery was founded with a singular vision — to bring the finest quality handcrafted jewellery to discerning customers who appreciate artistry and excellence. Every piece in our collection tells a story of meticulous craftsmanship, premium materials, and timeless design.</p>
            <p>Our master artisans blend traditional techniques with contemporary aesthetics, creating pieces that transcend trends and become cherished heirlooms. From engagement rings that symbolize eternal love to statement necklaces that command attention, each creation undergoes rigorous quality checks to ensure it meets our exacting standards.</p>
          </div>

          <div class="values-grid">
            <div class="value-card">
              <span class="value-icon">🏆</span>
              <h3>Heritage</h3>
              <p>Three decades of expertise in fine jewellery craftsmanship</p>
            </div>
            <div class="value-card">
              <span class="value-icon">💎</span>
              <h3>Quality</h3>
              <p>Only BIS hallmarked gold and GIA certified diamonds</p>
            </div>
            <div class="value-card">
              <span class="value-icon">🎨</span>
              <h3>Design</h3>
              <p>Unique designs that blend tradition with modernity</p>
            </div>
            <div class="value-card">
              <span class="value-icon">🤝</span>
              <h3>Trust</h3>
              <p>Over 10,000 happy customers worldwide</p>
            </div>
          </div>

          <div class="cta-section">
            <h2>Ready to Find Your Perfect Piece?</h2>
            <a routerLink="/shop" class="btn btn-primary">Explore Collection →</a>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .about-hero {
      padding: 80px 0 60px; text-align: center;
      background: linear-gradient(135deg, rgba(212,175,55,0.08), transparent);
      border-bottom: 1px solid #222;
    }
    .about-hero h1 { font-size: 3rem; margin-bottom: 12px; }
    .gold { color: #D4AF37; }
    .about-hero p { color: #777; font-size: 1.1rem; }
    .about-content { padding: 60px 0; }
    .about-text { max-width: 800px; margin: 0 auto 60px; text-align: center; }
    .about-text h2 { color: #D4AF37; margin-bottom: 20px; font-size: 1.8rem; }
    .about-text p { color: #B0B0B0; line-height: 1.8; margin-bottom: 16px; font-size: 1.05rem; }
    .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 60px; }
    .value-card {
      text-align: center; padding: 40px 24px; background: #1E1E1E;
      border: 1px solid #333; border-radius: 12px; transition: 0.3s;
    }
    .value-card:hover { border-color: rgba(212,175,55,0.4); transform: translateY(-4px); }
    .value-icon { font-size: 2.5rem; display: block; margin-bottom: 16px; }
    .value-card h3 { color: #D4AF37; margin-bottom: 8px; font-family: 'Poppins'; }
    .value-card p { color: #777; font-size: 0.9rem; line-height: 1.6; }
    .cta-section { text-align: center; padding: 60px; background: #1A1A1A; border-radius: 16px; border: 1px solid #333; }
    .cta-section h2 { color: #fff; margin-bottom: 20px; }
    @media (max-width: 768px) { .values-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class AboutComponent { }
