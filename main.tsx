/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import "./src/ui/preact/index.css";

import { render } from "preact";

import { App } from "./app";

render(<App />, document.getElementById("app")!);
