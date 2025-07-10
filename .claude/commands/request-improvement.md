### Self-Improvement Mandate: Code Refinement

**Objective:**
Your task is to review your recent code contributions and refactor them to align with our newly solidified development principles. Act as a senior developer reviewing your own work, with the goal of improving its quality, consistency, and maintainability.

**The Guiding Philosophy:**
Evaluate your code through the lens of the following core tenets:

1.  **Strict Adherence to the Design System:** Does the code exclusively use standard, pre-styled components from our `daisyUI` library? Or does it contain custom-styled elements that could be replaced for better consistency?
2.  **Centralized State Management:** Is all relevant state handled through the established Redux store, reusing existing selectors and actions? Or is there any duplicated, local, or redundant state management?
3.  **Visual and Architectural Consistency:** Does the feature integrate seamlessly into the existing look, feel, and layout of the page? Does it follow established patterns for component structure and composition?
4.  **Encapsulation and Clarity:** Is logic properly encapsulated within single-responsibility components? Is the code clean, readable, and easy to understand?

**Your Task:**

1.  **Review:** Critically analyze your most recent implementation.
2.  **Identify:** Pinpoint any specific lines, components, or patterns that deviate from the guiding philosophy above.
3.  **Refactor and Justify:** For each identified deviation, propose a specific code change. You must provide:
    *   A clear **rationale** explaining which principle the original code violates.
    *   The **refactored code** that aligns with our standards. 