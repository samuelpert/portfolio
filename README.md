# Space-Themed Portfolio Website

<div align="center">
  <img src="/public/p2.png" alt="Portfolio Screenshot 1" width="600"/>
  <p><em>Main portfolio interface showcasing the space theme</em></p>
  <br>
  <div style="display: flex; justify-content: space-between;">
    <img src="/public/rp2.png" alt="Black Hole Entry Animation" width="400"/>
    <img src="/public/rp3.png" alt="Project Showcase" width="400"/>
  </div>
  <p><em>Left: Black hole entry animation | Right: Project cards with 3D hover effects</em></p>
</div>

A space-themed personal portfolio website that simulates entering the singularity inside a black hole. This interactive portfolio features custom animations, 3D effects, and a sleek modern design to showcase projects and skills.

## ✨ Features

- **Interactive Entry Animation**: Simulates entering a black hole to access the portfolio
- **Dynamic Star Background**: Animated star field for an immersive space experience
- **3D Project Cards**: Tilt and hover effects for engaging project displays
- **Responsive Design**: Fully optimized for all device sizes
- **Smooth Scroll Navigation**: Easy navigation between different sections

## 🚀 Technologies Used

- **Next.js**: React framework for server-side rendering and optimized performance
- **TypeScript**: Type-safe JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Three Fiber**: React renderer for Three.js to create 3D elements
- **Maath**: Math utilities for Three.js applications
- **Aceternity UI**: Custom UI components

## 🌌 Inspiration

This project is inspired by the movie **Interstellar**. As a huge fan of Christopher Nolan's movie, I aimed to represent **Gargantua's black hole** in my portfolio.

## 📷 Credits

- **Image**:

  - Black hole: NASA’s Goddard Space Flight Center/Jeremy Schnittman

- **Video**:
  - Black Hole Visualization: NASA's Goddard Space Flight Center/J. Schnittman and B. Powell

## 🛠️ Installation & Setup

1. Clone the repository

   ```bash
   git clone https://github.com/samuelpert/portfolio-website.git
   cd portfolio-website
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## 📁 Project Structure

```
app/
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   └── ...           # Feature components
├── data.ts           # Project and navigation data
├── lib/              # Utility functions
├── globals.css       # Global styles
└── page.tsx          # Main application page
public/
├── videos/           # Video assets for animations
└── ...               # Other static assets
```

## 🔧 Key Components

- **InitialPage**: Initial black hole animation sequence
- **LandingOverlay**: Blackhole transition
- **Hero**: Main introduction section with spotlight effects
- **Projects**: Project showcase with 3D card hover effects
- **StarBackground**: Animated star field background
- **PinContainer**: 3D card container with perspective effects

## 📱 Responsive Design

The portfolio is fully responsive with tailored designs for:

- Mobile devices
- Tablets
- Desktop screens
- Large displays

## 🌐 Deployment

This site can be easily deployed using Vercel:

1. Push your code to a GitHub repository
2. Import the repository to Vercel
3. Deploy with one click

## 🔮 Future Enhancements

- [ ] Add work experience section (Once I gain experience)
- [ ] Create a blog section

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Feel free to reach out via [LinkedIn](https://www.linkedin.com/in/samuel-perez-tovar/) or [GitHub](https://github.com/samuelpert) for any questions or collaboration opportunities!
