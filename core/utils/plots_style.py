import matplotlib.pyplot as plt

def style(bg_color='#1f242c', text_color='#ffffff', grid_color='#6b6b6b'):

    plt.rcParams.update({
        'figure.facecolor': bg_color,
        'axes.facecolor': bg_color,
        'savefig.facecolor': bg_color,
        'savefig.edgecolor': bg_color,

        'axes.edgecolor': 'none',
        'axes.labelcolor': text_color,
        'axes.titlecolor': text_color,
        'xtick.color': text_color,
        'ytick.color': text_color,
        'text.color': text_color,
        'grid.color': grid_color,
        'grid.alpha': 0.2,

        'font.family': 'DejaVu Sans',
        'font.size': 11,
        'axes.titlesize': 12,
        'axes.titleweight': 'bold',
        'axes.labelsize': 12,

        'axes.labelpad': 20,

        'axes.grid': True,
        'axes.spines.top': False,
        'axes.spines.right': False,
        'axes.spines.left': False,
        'axes.spines.bottom': False,

        'lines.linewidth': 2,
        'lines.markersize': 5,
        'lines.markeredgewidth': 0.5,

        'legend.facecolor': bg_color,
        'legend.edgecolor': 'none',
        'legend.labelcolor': text_color,
        'legend.fontsize': 10,
        'legend.frameon': False,

        'figure.autolayout': True,
    })
