import { motion  } from "framer-motion";

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{ height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default PageWrapper;