#!/usr/bin/env python3
"""
Retro 8-bit UI Sound Effects Generator
Generates 13 classic arcade-style UI sounds using wave synthesis
"""

import wave
import struct
import math
import os

class SoundGenerator:
    """Generate 8-bit retro sound effects"""

    def __init__(self, sample_rate=22050, bit_depth=16):
        self.sample_rate = sample_rate
        self.bit_depth = bit_depth
        self.max_amplitude = (2 ** (bit_depth - 1)) - 1

    def sine_wave(self, frequency, duration, amplitude=0.8):
        """Generate a sine wave"""
        samples = []
        num_samples = int(self.sample_rate * duration)
        for i in range(num_samples):
            t = i / self.sample_rate
            sample = amplitude * math.sin(2 * math.pi * frequency * t)
            samples.append(sample)
        return samples

    def square_wave(self, frequency, duration, amplitude=0.8):
        """Generate a square wave (8-bit retro style)"""
        samples = []
        num_samples = int(self.sample_rate * duration)
        for i in range(num_samples):
            t = i / self.sample_rate
            # Simple square wave
            sample = amplitude if (t * frequency * 2) % 2 < 1 else -amplitude
            samples.append(sample)
        return samples

    def noise(self, duration, amplitude=0.6):
        """Generate white noise"""
        import random
        samples = []
        num_samples = int(self.sample_rate * duration)
        for _ in range(num_samples):
            samples.append(amplitude * (random.random() * 2 - 1))
        return samples

    def envelope(self, samples, attack=0.01, decay=0.01, sustain=0.8, release=0.02):
        """Apply ADSR envelope to samples"""
        total_duration = len(samples) / self.sample_rate
        attack_samples = int(self.sample_rate * attack)
        decay_samples = int(self.sample_rate * decay)
        release_samples = int(self.sample_rate * release)
        sustain_samples = len(samples) - attack_samples - decay_samples - release_samples

        if sustain_samples < 0:
            sustain_samples = 0

        result = []

        # Attack
        for i in range(attack_samples):
            result.append(samples[i] * (i / attack_samples))

        # Decay
        for i in range(decay_samples):
            idx = attack_samples + i
            result.append(samples[idx] * (1 - (1 - sustain) * (i / decay_samples)))

        # Sustain
        for i in range(sustain_samples):
            idx = attack_samples + decay_samples + i
            result.append(samples[idx] * sustain)

        # Release
        for i in range(release_samples):
            idx = attack_samples + decay_samples + sustain_samples + i
            result.append(samples[idx] * (sustain * (1 - i / release_samples)))

        return result[:len(samples)]

    def frequency_sweep(self, start_freq, end_freq, duration, amplitude=0.8, wave_type='sine'):
        """Generate a frequency sweep (pitch modulation)"""
        samples = []
        num_samples = int(self.sample_rate * duration)
        for i in range(num_samples):
            t = i / self.sample_rate
            # Linear frequency sweep
            frequency = start_freq + (end_freq - start_freq) * (t / duration)

            if wave_type == 'sine':
                sample = amplitude * math.sin(2 * math.pi * frequency * t)
            elif wave_type == 'square':
                sample = amplitude if ((t * frequency * 2) % 2 < 1) else -amplitude

            samples.append(sample)

        return samples

    def tremolo(self, samples, lfo_freq=5, depth=0.5):
        """Apply tremolo (amplitude modulation)"""
        result = []
        for i, sample in enumerate(samples):
            t = i / self.sample_rate
            lfo = 1 + depth * math.sin(2 * math.pi * lfo_freq * t)
            result.append(sample * lfo)
        return result

    def save_wav(self, filename, samples):
        """Save samples to WAV file"""
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        # Normalize samples to prevent clipping
        max_sample = max(abs(min(samples)), abs(max(samples)))
        if max_sample > 0:
            samples = [s / max_sample * 0.95 for s in samples]

        # Convert to integer samples
        int_samples = [int(s * self.max_amplitude) for s in samples]

        with wave.open(filename, 'w') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(self.bit_depth // 8)
            wav_file.setframerate(self.sample_rate)

            # Pack samples as 16-bit integers
            packed_data = b''.join(
                struct.pack('<h', sample) for sample in int_samples
            )
            wav_file.writeframes(packed_data)

    def generate_ui_select(self, output_path):
        """Short bright blip (high pitch, ~0.08s)"""
        samples = self.square_wave(800, 0.08, amplitude=0.8)
        samples = self.envelope(samples, attack=0.005, decay=0.02, sustain=0.6, release=0.02)
        self.save_wav(output_path, samples)

    def generate_ui_navigate(self, output_path):
        """Quick tick sound (~0.05s, medium pitch)"""
        samples = self.square_wave(600, 0.05, amplitude=0.7)
        samples = self.envelope(samples, attack=0.002, decay=0.01, sustain=0.4, release=0.015)
        self.save_wav(output_path, samples)

    def generate_ui_cancel(self, output_path):
        """Descending two-tone (~0.15s)"""
        samples1 = self.sine_wave(500, 0.075, amplitude=0.7)
        samples1 = self.envelope(samples1, attack=0.01, decay=0.02, sustain=0.5, release=0.03)

        samples2 = self.sine_wave(300, 0.075, amplitude=0.7)
        samples2 = self.envelope(samples2, attack=0.01, decay=0.02, sustain=0.5, release=0.03)

        samples = samples1 + samples2
        self.save_wav(output_path, samples)

    def generate_timer_warning(self, output_path):
        """Urgent beep-beep (~0.3s, alternating pitch)"""
        samples = []
        for _ in range(3):
            samples.extend(self.square_wave(900, 0.05, amplitude=0.8))
            samples.extend(self.sine_wave(0, 0.05, amplitude=0))  # Silence

        samples = self.envelope(samples, attack=0.005, decay=0.01, sustain=0.7, release=0.01)
        self.save_wav(output_path, samples)

    def generate_round_bell(self, output_path):
        """Boxing bell ding (~0.4s, metallic ring)"""
        # Combination of frequencies for bell-like sound
        all_samples = []
        for freq in [800, 1200, 1600]:
            samples_partial = self.sine_wave(freq, 0.4, amplitude=0.3)
            samples_partial = self.envelope(
                samples_partial, attack=0.01, decay=0.1, sustain=0.3, release=0.2
            )
            all_samples.append(samples_partial)

        # Mix frequencies together
        samples = [sum(s) for s in zip(*all_samples)]

        # Add tremolo for metallic effect
        samples = self.tremolo(samples, lfo_freq=4, depth=0.3)
        self.save_wav(output_path, samples)

    def generate_stamina_warning(self, output_path):
        """Low pulsing alarm (~0.3s)"""
        samples = []
        for _ in range(3):
            samples.extend(self.square_wave(250, 0.05, amplitude=0.7))
            samples.extend(self.sine_wave(0, 0.05, amplitude=0))  # Silence

        samples = self.envelope(samples, attack=0.01, decay=0.02, sustain=0.6, release=0.02)
        self.save_wav(output_path, samples)

    def generate_move_confirm(self, output_path):
        """Satisfying confirmation chirp (~0.12s, ascending)"""
        samples = self.frequency_sweep(400, 700, 0.12, amplitude=0.8, wave_type='sine')
        samples = self.envelope(samples, attack=0.01, decay=0.01, sustain=0.7, release=0.03)
        self.save_wav(output_path, samples)

    def generate_sub_attempt(self, output_path):
        """Dramatic whoosh/swoosh (~0.3s)"""
        samples = self.frequency_sweep(1200, 300, 0.3, amplitude=0.7, wave_type='square')
        samples = self.envelope(samples, attack=0.01, decay=0.1, sustain=0.5, release=0.1)
        self.save_wav(output_path, samples)

    def generate_minigame_tick(self, output_path):
        """Metronome tick (~0.04s, sharp)"""
        samples = self.square_wave(1000, 0.04, amplitude=0.8)
        samples = self.envelope(samples, attack=0.001, decay=0.005, sustain=0.5, release=0.015)
        self.save_wav(output_path, samples)

    def generate_minigame_fail(self, output_path):
        """Sad descending tones (~0.4s)"""
        samples1 = self.sine_wave(400, 0.2, amplitude=0.7)
        samples1 = self.envelope(samples1, attack=0.02, decay=0.05, sustain=0.4, release=0.05)

        samples2 = self.sine_wave(250, 0.2, amplitude=0.7)
        samples2 = self.envelope(samples2, attack=0.02, decay=0.05, sustain=0.4, release=0.05)

        samples = samples1 + samples2
        self.save_wav(output_path, samples)

    def generate_xp_gain(self, output_path):
        """Ascending arpeggio (~0.3s, happy)"""
        frequencies = [440, 550, 660, 550, 660, 440]  # A C E pattern
        samples = []

        for freq in frequencies:
            samples.extend(self.sine_wave(freq, 0.05, amplitude=0.7))

        samples = self.envelope(samples, attack=0.01, decay=0.02, sustain=0.6, release=0.02)
        self.save_wav(output_path, samples)

    def generate_challenge_complete(self, output_path):
        """Fanfare/victory jingle (~0.5s)"""
        frequencies = [523, 659, 784, 523, 659, 784, 1047]  # C E G major chord progression
        samples = []

        for freq in frequencies:
            samples.extend(self.sine_wave(freq, 0.07, amplitude=0.7))

        samples = self.envelope(samples, attack=0.01, decay=0.02, sustain=0.7, release=0.02)
        self.save_wav(output_path, samples)

    def generate_character_unlock(self, output_path):
        """Magical sparkle sound (~0.5s)"""
        # Combination of high frequencies with noise
        samples = []

        # High-pitched tones
        for freq in [1200, 1600, 2000, 1600, 1200]:
            samples.extend(self.sine_wave(freq, 0.06, amplitude=0.5))

        # Mix with some noise for sparkle effect
        noise_samples = self.noise(0.5, amplitude=0.3)
        samples = samples[:len(noise_samples)]
        samples = [s + n for s, n in zip(samples, noise_samples)]

        samples = self.envelope(samples, attack=0.01, decay=0.05, sustain=0.5, release=0.15)
        self.save_wav(output_path, samples)


def main():
    """Generate all UI sounds"""
    output_dir = "/sessions/fervent-nice-sagan/mnt/BJJ 16bit game/audio/ui"
    os.makedirs(output_dir, exist_ok=True)

    generator = SoundGenerator(sample_rate=22050, bit_depth=16)

    sounds = [
        ('ui-select.wav', generator.generate_ui_select),
        ('ui-navigate.wav', generator.generate_ui_navigate),
        ('ui-cancel.wav', generator.generate_ui_cancel),
        ('timer-warning.wav', generator.generate_timer_warning),
        ('round-bell.wav', generator.generate_round_bell),
        ('stamina-warning.wav', generator.generate_stamina_warning),
        ('move-confirm.wav', generator.generate_move_confirm),
        ('sub-attempt.wav', generator.generate_sub_attempt),
        ('minigame-tick.wav', generator.generate_minigame_tick),
        ('minigame-fail.wav', generator.generate_minigame_fail),
        ('xp-gain.wav', generator.generate_xp_gain),
        ('challenge-complete.wav', generator.generate_challenge_complete),
        ('character-unlock.wav', generator.generate_character_unlock),
    ]

    print("Generating 13 retro 8-bit UI sound effects...")
    print("-" * 60)

    for filename, generator_func in sounds:
        filepath = os.path.join(output_dir, filename)
        generator_func(filepath)

        # Get file size
        file_size = os.path.getsize(filepath)
        status = "✓" if file_size > 100 else "✗"
        print(f"{status} {filename:30s} - {file_size:7,d} bytes")

    print("-" * 60)
    print(f"All sounds generated successfully in: {output_dir}")


if __name__ == "__main__":
    main()
