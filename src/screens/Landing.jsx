import React, { useState } from 'react';
import {
  Box, Button, Typography, Card, Stack, Grid, Chip, IconButton, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BoltIcon from '@mui/icons-material/Bolt';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ---------------------------------------------------------------------------
// CampusHub landing page.
// The hero contains a genuine CSS 3D scene (perspective + preserve-3d):
// module cards float in real depth, orbit slowly, and tilt toward the mouse.
// No extra libraries — just transforms and keyframes.
// ---------------------------------------------------------------------------

const MODULE_CARDS = [
  { icon: <LocationOnIcon fontSize="small" />, label: 'Lost & Found', color: '#4F46E5', depth: 90, orbit: 0 },
  { icon: <ShoppingBagIcon fontSize="small" />, label: 'Marketplace', color: '#0D9488', depth: 40, orbit: 90 },
  { icon: <EventIcon fontSize="small" />, label: 'Events', color: '#DB2777', depth: -40, orbit: 180 },
  { icon: <MenuBookIcon fontSize="small" />, label: 'Notes', color: '#D97706', depth: -90, orbit: 270 },
];

const FEATURES = [
  {
    icon: <LocationOnIcon fontSize="small" />, tint: '#EEF2FF', ink: '#4F46E5',
    title: 'Lost & Found',
    text: 'Post lost or found items, claim with proof, and reunite property in hours — not weeks.',
  },
  {
    icon: <ShoppingBagIcon fontSize="small" />, tint: '#CCFBF1', ink: '#0D9488',
    title: 'Marketplace',
    text: 'Buy and sell textbooks, furniture and gadgets safely inside your own campus.',
  },
  {
    icon: <BoltIcon fontSize="small" />, tint: '#FEF3C7', ink: '#D97706',
    title: 'Skill Exchange',
    text: 'Trade what you know for what you want to learn — tutoring, design, coding and more.',
  },
  {
    icon: <EventIcon fontSize="small" />, tint: '#FCE7F3', ink: '#DB2777',
    title: 'Campus Events',
    text: 'Discover workshops, fests and club meetups with one-tap registration.',
  },
  {
    icon: <MenuBookIcon fontSize="small" />, tint: '#E0E7FF', ink: '#4338CA',
    title: 'Study Notes',
    text: 'Share and download course notes, rate the best ones, and track downloads.',
  },
  {
    icon: <CheckCircleIcon fontSize="small" />, tint: '#DCFCE7', ink: '#16A34A',
    title: 'Moderated & Safe',
    text: 'Report any post, admin tools built in, and university-only accounts.',
  },
];

function ModuleCard({ card, index }) {
  // Two layers: the outer box places the card on the 3D orbit, the inner box
  // runs the floaty bobbing animation — separate so transforms never clash.
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 132,
        ml: -66,
        mt: -30,
        transformStyle: 'preserve-3d',
        transform: `rotateY(${card.orbit}deg) translateZ(118px) translateZ(${card.depth / 4}px) rotateY(${-card.orbit}deg) translateY(${index % 2 ? -14 : 14}px)`,
      }}
    >
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          transformStyle: 'preserve-3d',
          animation: `floaty ${5.5 + index * 0.7}s ease-in-out ${index * 0.45}s infinite`,
          zIndex: hovered ? 5 : 1,
          transition: 'filter 0.3s',
          filter: hovered ? 'brightness(1.08)' : 'none',
        }}
      >
      <Card
        elevation={0}
        sx={{
          p: 1.5,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 18px 40px -12px rgba(30,27,75,0.35)',
          bgcolor: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(6px)',
          transform: `translateZ(${hovered ? 26 : 0}px) scale(${hovered ? 1.06 : 1})`,
          transition: 'transform 0.35s cubic-bezier(.2,.7,.3,1)',
          cursor: 'default',
        }}
      >
        <Box sx={{
          width: 34, height: 34, mx: 'auto', mb: 0.75, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: card.color, color: 'white',
        }}>
          {card.icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{card.label}</Typography>
      </Card>
      </Box>
    </Box>
  );
}

function HeroScene({ reducedMotion }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tilt, setTilt] = useState({ x: -12, y: 0 });

  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 .. 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -12 - py * 14, y: px * 16 });
  };

  return (
    <Box
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: -12, y: 0 })}
      sx={{
        position: 'relative',
        height: { xs: 300, sm: 360, md: 420 },
        perspective: '1100px', // the 3D camera distance
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Soft glow behind the scene */}
      <Box sx={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.28), rgba(99,102,241,0) 70%)',
        filter: 'blur(10px)',
      }} />

      {/* The stage is layered: outer box tilts with the mouse, inner box
          spins continuously — separate layers so the transforms never fight. */}
      <Box
        sx={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.5s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 300,
            height: 300,
            transformStyle: 'preserve-3d',
            animation: reducedMotion || isMobile ? 'none' : 'scene-spin 26s linear infinite',
          }}
        >
        {/* Orbit rings on the "floor" of the scene */}
        {[118, 88].map((r) => (
          <Box key={r} sx={{
            position: 'absolute', top: '50%', left: '50%',
            width: r * 2, height: r * 2, ml: -r, mt: -r,
            borderRadius: '50%',
            border: '1px dashed rgba(79,70,229,0.35)',
            transform: 'rotateX(78deg)',
          }} />
        ))}

        {/* Center hub */}
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          width: 76, height: 76, ml: -38, mt: -38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          boxShadow: '0 20px 45px -10px rgba(79,70,229,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', transformStyle: 'preserve-3d',
          animation: 'pulse 3.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'translateZ(30px) scale(1)' },
            '50%': { transform: 'translateZ(46px) scale(1.05)' },
          },
        }}>
          <SchoolIcon sx={{ fontSize: 34 }} />
        </Box>

        {MODULE_CARDS.map((card, i) => (
          <ModuleCard key={card.label} card={card} index={i} />
        ))}

        {/* Bobbing + spin animations used by the cards and the stage */}
        <style>{`
          @keyframes floaty {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes scene-spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; }
          }
        `}</style>
        </Box>
      </Box>
    </Box>
  );
}

export default function Landing({ onGetStarted }) {
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F5FA', overflow: 'hidden' }}>
      {/* ---------- Top bar ---------- */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 2, md: 6 }, py: 1.5,
        position: 'relative', zIndex: 10,
      }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 2, bgcolor: 'primary.main', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SchoolIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>CampusHub</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => onGetStarted('login')} sx={{ color: '#4B5563' }}>
            Sign In
          </Button>
          <Button variant="contained" onClick={() => onGetStarted('register')} endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}>
            Get Started
          </Button>
        </Stack>
      </Box>

      {/* ---------- Hero ---------- */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
        alignItems: 'center',
        gap: { xs: 2, md: 4 },
        px: { xs: 2.5, md: 6 },
        pt: { xs: 2, md: 4 },
        pb: { xs: 4, md: 6 },
        maxWidth: 1160, mx: 'auto',
      }}>
        <Box>
          <Chip
            label="Built for one university — free for students"
            size="small"
            variant="outlined"
            sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.7)', borderColor: '#E0E7FF' }}
          />
          <Typography sx={{
            fontWeight: 800, color: '#111827', lineHeight: 1.15, mb: 1.5,
            fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.7rem' },
          }}>
            Everything campus,<br />
            <Box component="span" sx={{ color: 'primary.main' }}>in one hub.</Box>
          </Typography>
          <Typography sx={{ color: '#6B7280', mb: 3, maxWidth: 460, fontSize: '0.95rem' }}>
            Lost &amp; found, marketplace, skill swaps, events and study notes —
            one login for your whole university life. No more scattered group chats.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              size="medium"
              onClick={() => onGetStarted('register')}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 17 }} />}
              sx={{ px: 3, py: 0.9, boxShadow: '0 10px 25px -8px rgba(79,70,229,0.6)' }}
            >
              Join your campus
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={() => onGetStarted('login')}
              sx={{ px: 3, py: 0.9, borderColor: '#D1D5DB', color: '#374151' }}
            >
              Sign In
            </Button>
          </Stack>

          <Stack direction="row" spacing={3} sx={{ mt: 3.5 }}>
            {[
              { v: '5', l: 'campus modules' },
              { v: '1-click', l: 'registration' },
              { v: '24/7', l: 'moderated' },
            ].map((s) => (
              <Box key={s.l}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>{s.v}</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.72rem' }}>{s.l}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <HeroScene reducedMotion={prefersReducedMotion} />
      </Box>

      {/* ---------- Features ---------- */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, pb: 6, maxWidth: 1160, mx: 'auto' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#111827', mb: 0.5 }}>
          Five modules, zero chaos
        </Typography>
        <Typography sx={{ color: '#6B7280', mb: 3, fontSize: '0.875rem' }}>
          Everything students actually need, moderated by your own admins.
        </Typography>

        <Grid container spacing={2}>
          {FEATURES.map((f, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
              {/* 3D hover tilt: the card lifts and leans toward the cursor */}
              <Card
                elevation={0}
                className="tilt-card"
                sx={{
                  p: 2.5, height: '100%', borderRadius: 3, border: '1px solid #EEF0F6',
                  bgcolor: 'white', cursor: 'default',
                  transformStyle: 'preserve-3d',
                  transition: 'transform .35s cubic-bezier(.2,.7,.3,1), box-shadow .35s',
                  willChange: 'transform',
                  '&:hover': {
                    transform: 'perspective(700px) rotateX(4deg) rotateY(-5deg) translateZ(10px)',
                    boxShadow: '0 24px 50px -20px rgba(30,27,75,0.35)',
                  },
                }}
              >
                <Box sx={{
                  width: 36, height: 36, mb: 1.5, borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: f.tint, color: f.ink,
                }}>
                  {f.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827', mb: 0.5 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.55 }}>
                  {f.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ---------- Bottom CTA ---------- */}
      <Box sx={{
        mx: { xs: 2.5, md: 6 }, mb: 4, borderRadius: 4, p: { xs: 3, md: 4 },
        background: 'linear-gradient(120deg, #4F46E5, #6366F1 55%, #0D9488)',
        color: 'white',
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center', justifyContent: 'space-between', gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
            Ready to join your campus community?
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '0.85rem' }}>
            Register with your university email and start in under a minute.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          onClick={() => onGetStarted('register')}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 17 }} />}
          sx={{ bgcolor: 'white', color: 'primary.main', px: 3, '&:hover': { bgcolor: '#F3F4F6' } }}
        >
          Get Started
        </Button>
      </Box>

      <Typography sx={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.72rem', pb: 3 }}>
        CampusHub — single-university campus platform
      </Typography>
    </Box>
  );
}
