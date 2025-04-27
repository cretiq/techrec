"use client";

import React from 'react';
import { motion } from 'framer-motion';

const ShowcasePage: React.FC = () => {
  const boxVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.6,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { type: 'spring', stiffness: 300 } },
    tap: { scale: 0.9 },
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger animation for children
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Framer Motion Showcase
      </h1>

      {/* Basic Animation with Variants */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Basic Animation</h2>
        <motion.div
          className="w-32 h-32 bg-blue-500 rounded-lg shadow-lg mx-auto"
          variants={boxVariants}
          initial="hidden"
          animate="visible"
        />
        <motion.p
          className="mt-4 text-center text-gray-600"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          Animated box and text using variants.
        </motion.p>
      </section>

      {/* Interaction Animations */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Interactions</h2>
        <motion.button
          className="px-6 py-3 bg-green-500 text-white rounded-md shadow-md block mx-auto focus:outline-none"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Hover & Tap Me!
        </motion.button>
      </section>

      {/* Keyframes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Keyframes</h2>
        <motion.div
          className="w-16 h-16 bg-purple-500 rounded-full mx-auto"
          animate={{
            scale: [1, 1.2, 1.2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ['20%', '20%', '50%', '50%', '20%'],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      </section>

      {/* Staggered List Animation */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Staggered List</h2>
        <motion.ul
          className="space-y-2 list-disc list-inside"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, index) => (
            <motion.li key={index} variants={listItemVariants}>
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </section>

       {/* Drag Animation */}
       <section>
        <h2 className="text-2xl font-semibold mb-4">Drag</h2>
         <motion.div
           className="w-24 h-24 bg-red-500 rounded-lg shadow-lg cursor-grab mx-auto"
           drag
           dragConstraints={{
             top: -5,
             left: -5,
             right: 5,
             bottom: 5,
           }}
         />
       </section>

    </div>
  );
};

export default ShowcasePage; 