import React, { PropsWithChildren } from "react";
import styles from "./Layout.module.css";

export default function Layout({ children }: PropsWithChildren<unknown>) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
