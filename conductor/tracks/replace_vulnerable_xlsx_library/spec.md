# Specification: Replace Vulnerable XLSX Library

## Overview
This track addresses the critical security vulnerabilities (Prototype Pollution and ReDoS) identified in the `xlsx` package (SheetJS) currently used in the project. The primary goal is to replace this vulnerable library with a secure, well-maintained alternative that provides equivalent functionality for parsing Excel files.

## Goals
- Mitigate high-severity security risks associated with `xlsx@0.18.5`.
- Ensure continued functionality of Excel file import in the Admin section.
- Maintain or improve performance of Excel file parsing.

## Functional Requirements
- The new library must support reading `.xlsx` and `.xls` file formats.
- The new library must be able to convert Excel sheet data into a JSON format compatible with the existing `import-parser` utility's output structure.
- The Admin Products Import feature (`src/app/admin/products/page.tsx`) must continue to function correctly, allowing administrators to upload and import product data from Excel files.

## Non-Functional Requirements
- **Security:** The chosen library must not have any known high-severity vulnerabilities.
- **Maintainability:** The library should be actively maintained and have good documentation.
- **Performance:** Parsing performance should be comparable to or better than the current `xlsx` library.
- **Compatibility:** Must be compatible with Next.js (App Router), TypeScript, and the existing project structure.

## Technical Requirements
- Research and identify suitable alternative libraries (e.g., `exceljs`, `read-excel-file`).
- Update `src/utils/import-parser.ts` to use the new library.
- Update `src/utils/__tests__/import-parser.test.ts` to reflect the new library's usage and ensure comprehensive test coverage.
- Uninstall the `xlsx` package from `package.json` and `package-lock.json`.

## Acceptance Criteria
- [ ] The `xlsx` package is no longer listed as a dependency in `package.json` or `package-lock.json`.
- [ ] All unit tests in `src/utils/__tests__/import-parser.test.ts` pass with the new library implementation.
- [ ] Manual verification: Uploading a product Excel file (both `.xlsx` and `.xls` format) via the Admin Products Import page successfully parses and displays the data without errors.
- [ ] No new high-severity vulnerabilities are introduced by the new library according to a security scan.

## Out of Scope
- Implementing advanced Excel features not currently supported by `xlsx` (e.g., macros, complex formulas that aren't evaluated).
- Support for other file formats (e.g., Google Sheets, ODS) unless explicitly required by the chosen library.
