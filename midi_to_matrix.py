import pretty_midi
import json
import sys
import os
from collections import defaultdict

def get_note_name(midi_note):
    note_names = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI']
    octave = (midi_note // 12) - 1
    note_index = midi_note % 12
    return f"{note_names[note_index]}{octave}"

def generate_transition_matrix(midi_file):
    pm = pretty_midi.PrettyMIDI(midi_file)    
    transitions = defaultdict(lambda: defaultdict(int))
    total_transitions = defaultdict(int)    
    basic_notes = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI']
    
    for note in basic_notes:
        transitions[note] = {target: 0 for target in basic_notes}
    
    for instrument in pm.instruments:
        if not instrument.is_drum:
            note_starts = [(note.start, note.pitch) for note in instrument.notes]
            note_starts.sort(key=lambda x: x[0])
            
            for i in range(len(note_starts) - 1):
                current_note = get_note_name(note_starts[i][1])
                next_note = get_note_name(note_starts[i + 1][1])
                
                if (current_note.endswith('4') and next_note.endswith('4') and
                    current_note[:-1] in basic_notes and next_note[:-1] in basic_notes):
                    transitions[current_note[:-1]][next_note[:-1]] += 1
                    total_transitions[current_note[:-1]] += 1
    
    transition_matrix = {}
    for current_note in basic_notes:
        if total_transitions[current_note] > 0:
            transition_matrix[current_note] = {
                next_note: count / total_transitions[current_note]
                for next_note, count in transitions[current_note].items()
            }
        else:
            transition_matrix[current_note] = {
                note: 1.0 / len(basic_notes)
                for note in basic_notes
            }
    
    return transition_matrix

def main():
    if len(sys.argv) != 2:
        print("Usage: python midi_to_matrix.py <input_midi_file> ")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = input_file.rsplit('/', 1)[1]
    output_file = output_file.rsplit('.', 1)[0] + '.json'
    directory = "transition_matrices"
    output_file = os.path.join(directory, output_file)

    try:
        transition_matrix = generate_transition_matrix(input_file)
        
        with open(output_file, 'w') as f:
            json.dump(transition_matrix, f, indent=2)
        
        print(f"Transition matrix successfully exported to {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 