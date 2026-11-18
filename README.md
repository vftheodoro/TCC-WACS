# WACS — Wheelchair Automation Control System

**Assistive mobility | Mobile software | Embedded systems | Prototyping**

Interdisciplinary graduation project developed at **Etec Registro**. WACS explores ways to integrate wheelchair-control software, electronic components, sensors, and accessibility-focused digital services.

**Recognition:** the team reported placement among the seven highlighted projects at FETEPS 2025. See the project's event material for the exact award wording.

## Repository map

| Area | Directory | What it contains |
| --- | --- | --- |
| Documentation | `00 Documentos/` | Requirements, configuration, development, and test notes |
| Embedded electronics | `01 Arduino/` | Firmware experiments, motor control, sensors, and communication sketches |
| Application-related work | `02 Aplicativo/` | App material associated with the prototype |
| AI experiments | `03 Inteligencia Artificial/` | Python experiments involving mapping and voice assistance |
| Branding | `04 Logos da WACS/` | Visual materials |
| Demonstration site | `docs/` | Web presentation and related resources |

## Goals and engineering challenges

- Explore interaction between a mobile user interface and embedded electronics.
- Evaluate communication and sensor-based behavior for a mobility prototype.
- Investigate accessibility-oriented mapping and user interactions.
- Document experiments across software and hardware disciplines.

**Implementation note:** this repository contains experiments and project artifacts. Individual features described in presentations may have different levels of completion; do not assume all components constitute a fully integrated, production-ready device.

## Getting started

1. For **Arduino sketches**, open the chosen `.ino` file in the Arduino IDE and confirm the correct board, pin mappings, wiring, and available drivers before testing.
2. For **Python experiments**, review `03 Inteligencia Artificial/` and its imports; configure any dependencies required by the specific script.
3. For the **mobile application**, use [APP-WACS](https://github.com/vftheodoro/APP-WACS), which has its own setup guide.
4. For the **project website**, inspect the files in `docs/`.

## Safety

Wheelchair control and obstacle detection can affect physical safety. Never deploy or test a prototype with a person relying on it for mobility without appropriate engineering validation, supervised testing, physical failsafes, and regulatory review. This is an educational/research project, not a certified medical device.

## Team

**Technical advisor:** [Ramon Trigo](https://github.com/ramtrigodev).

**Project contributors listed in the original documentation:** Pedro Henrique Dias Santos, Luiz Alberto Iha Lima, Victor Gabriel Ferreira Theodoro, and Mario Armando Takahashi Martins Dias.

## Additional documentation

- [`00 Documentos/`](00%20Documentos/) — requirements and setup references.
- [`docs/`](docs/) — presentation website and supporting material.
- [Mobile app repository](https://github.com/vftheodoro/APP-WACS)

## License

See [LICENSE](LICENSE) for the repository's license terms.
