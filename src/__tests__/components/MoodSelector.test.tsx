import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoodSelector } from "../../components/MoodSelector";

describe("MoodSelector", () => {
  it("renders all 8 mood buttons", () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(8);
  });

  it("each button has an accessible label", () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={() => {}} />);
    expect(screen.getByLabelText("Select mood: Anxious")).toBeInTheDocument();
    expect(screen.getByLabelText("Select mood: Calm")).toBeInTheDocument();
    expect(screen.getByLabelText("Select mood: Craving")).toBeInTheDocument();
  });

  it("calls onMoodSelect when a mood is clicked", () => {
    const onSelect = vi.fn();
    render(<MoodSelector selectedMood={null} onMoodSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText("Select mood: Calm"));
    expect(onSelect).toHaveBeenCalledWith("calm");
  });

  it("marks selected mood as pressed", () => {
    render(<MoodSelector selectedMood="calm" onMoodSelect={() => {}} />);
    expect(screen.getByLabelText("Select mood: Calm")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Select mood: Anxious")).toHaveAttribute("aria-pressed", "false");
  });

  it("disables all buttons when disabled prop is true", () => {
    render(<MoodSelector selectedMood={null} onMoodSelect={() => {}} disabled={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
