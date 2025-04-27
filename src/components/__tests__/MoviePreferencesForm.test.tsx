import { render, screen, fireEvent } from '@testing-library/react';
import MoviePreferencesForm from '../MoviePreferencesForm';

describe('MoviePreferencesForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with default values', () => {
    render(<MoviePreferencesForm onSubmit={mockOnSubmit} />);
    
    // Check if main elements are rendered
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('TV Series')).toBeInTheDocument();
    expect(screen.getByText(/Pick Your Movie Genres/)).toBeInTheDocument();
    expect(screen.getByText('🌍 Select Language')).toBeInTheDocument();
  });

  it('switches between movie and TV series', () => {
    render(<MoviePreferencesForm onSubmit={mockOnSubmit} />);
    
    // Initially shows movie genres
    expect(screen.getByText('Action')).toBeInTheDocument();
    
    // Switch to TV series
    fireEvent.click(screen.getByText('TV Series'));
    expect(screen.getByText('Action & Adventure')).toBeInTheDocument();
    
    // Switch back to movies
    fireEvent.click(screen.getByText('Movies'));
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('submits form with selected preferences', () => {
    render(<MoviePreferencesForm onSubmit={mockOnSubmit} />);
    
    // Select a genre
    fireEvent.click(screen.getByText('Action'));
    
    // Submit the form
    fireEvent.click(screen.getByText(/Pick Your Movie/));
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: 'movie',
        genres: expect.arrayContaining([28]), // Action genre ID
      })
    );
  });

  it('toggles advanced settings', () => {
    render(<MoviePreferencesForm onSubmit={mockOnSubmit} />);
    
    // Advanced settings should be hidden initially
    expect(screen.queryByText('📅 Year Range')).not.toBeInTheDocument();
    
    // Show advanced settings
    fireEvent.click(screen.getByText(/Advanced Settings/));
    
    // Advanced settings should be visible
    expect(screen.getByText('📅 Year Range')).toBeInTheDocument();
    expect(screen.getByText('⭐ Rating Range')).toBeInTheDocument();
  });
}); 