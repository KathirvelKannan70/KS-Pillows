import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" },
  }),
};

export default function About() {
  return (
    <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white">
      {/* background glow */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-emerald-200/40 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] bg-green-200/40 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-emerald-700 font-semibold tracking-[0.25em] mb-4">
            இயற்கையின் மென்மை • HERITAGE CRAFTSMANSHIP
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            About KS Pillows
          </h1>

          <div className="mt-5 h-[3px] w-32 bg-gradient-to-r from-emerald-600 to-green-400 mx-auto rounded-full" />
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Image */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="/images/kapok-pillow.jpg"
                alt="KS Pillows premium kapok pillow"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 backdrop-blur-md bg-white/80 px-5 py-3 rounded-xl shadow-lg">
                <p className="text-sm font-semibold text-gray-900">
                  Premium Natural Kapok
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-300/40 blur-2xl rounded-full" />
          </motion.div>

          {/* Content */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At{" "}
              <span className="font-semibold text-gray-900">
                KS Pillows
              </span>
              , we craft sleep experiences rooted in tradition and elevated by
              modern quality standards. Our premium kapok pillows are designed
              for those who value natural comfort and long-lasting support.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Filled with carefully selected kapok fiber —{" "}
              <span className="font-semibold text-emerald-700">
                “இயற்கையின் மென்மை”
              </span>{" "}
              — each pillow delivers breathable softness and eco-friendly
              purity you can trust.
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {[
                "100% Natural",
                "Quality Checked",
                "Wholesale Trusted",
                "Made in India",
              ].map((badge, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white/70 backdrop-blur"
                >
                  {badge}
                </div>
              ))}
            </div>

            {/* Premium strip */}
            <div className="mt-10 inline-block px-7 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow-xl">
              நிம்மதியான தூக்கம் • Naturally Better Sleep
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}