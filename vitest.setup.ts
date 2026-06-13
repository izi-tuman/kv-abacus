// Глобальный setup для Vitest: матчеры jest-dom + очистка DOM между тестами.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
	cleanup();
});
