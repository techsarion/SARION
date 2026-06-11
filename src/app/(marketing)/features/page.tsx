import type { Metadata } from "next";
import { Check } from "lucide-react";

import { SectionHeader } from "@/components/marketing/section-header";
import { ProductShot } from "@/components/marketing/product-shot";
import { CTASection } from "@/components/marketing/cta-section";
import { FEATURE_SECTIONS } from "@/lib/marketing/features";
import styles from "./features.module.css";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <>
      <section className="mSectionTight">
        <div className="mContainer">
          <SectionHeader
            eyebrow="Features"
            title="Everything agencies need to run client work"
            description="Sarion replaces the patchwork of tools agencies rely on with one focused workspace."
          />
        </div>
      </section>

      {FEATURE_SECTIONS.map((section, index) => (
        <section key={section.eyebrow} className="mSectionTight">
          <div className="mContainer">
            <div className={styles.row} data-reverse={index % 2 === 1}>
              <div className={styles.copy}>
                <span className="mEyebrow">{section.eyebrow}</span>
                <h2 className={styles.title}>{section.title}</h2>
                <ul className={styles.list}>
                  {section.features.map((feature) => (
                    <li key={feature} className={styles.item}>
                      <Check className={styles.check} aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.visual}>
                <ProductShot
                  name={section.shot}
                  alt={section.shotAlt}
                  url={`trysarion.com/${section.shot}`}
                  sizes="(max-width: 880px) 100vw, 540px"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTASection headline="See it in action with a free trial." />
    </>
  );
}
